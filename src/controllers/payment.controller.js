const BillService = require('../services/bill.service');
const Bill = require('../models/bill.model');

function getClientIp(req) {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    (req.connection && req.connection.socket && req.connection.socket.remoteAddress) ||
    '127.0.0.1';
  return ip.replace('::ffff:', '') || '127.0.0.1';
}

async function getVNPayInstance() {
  // Validate required env
  const tmnCode = process.env.VNP_TMN_CODE || process.env.VNPAY_TMN_CODE;
  const secureSecret = process.env.VNP_HASH_SECRET;
  const vnpHost = process.env.VNP_HOST || 'https://sandbox.vnpayment.vn';
  const testMode = String(process.env.VNP_TEST_MODE || 'true') === 'true';
  const hashAlgorithm = process.env.VNP_HASH_ALG || 'SHA512';
  if (!tmnCode || !secureSecret) {
    const err = new Error(
      'VNPay config missing: set VNP_TMN_CODE and VNP_HASH_SECRET in environment'
    );
    err.code = 'VNP_CONFIG_MISSING';
    throw err;
  }
  const mod = await import('../vnpay/vnpay.js');
  const VNPayClass = mod.VNPay || mod.default;
  const vnpay = new VNPayClass({
    tmnCode,
    secureSecret,
    vnpayHost: vnpHost,
    testMode,
    hashAlgorithm,
    enableLog: false,
  });
  return vnpay;
}

exports.createVNPayPayment = async (req, res) => {
  try {
    const { billId } = req.query;
    if (!billId) return res.status(400).json({ success: false, message: 'billId is required' });
    const bill = await Bill.findById(billId).lean();
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    if (bill.status === 'paid')
      return res.status(400).json({ success: false, message: 'Bill already paid' });

    const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const returnUrl = `${baseUrl}/api/payments/vnpay/return`;
    const ipnUrl = `${baseUrl}/api/payments/vnpay/ipn`;

    const vnpay = await getVNPayInstance();
    const txnRef = String(bill._id);

    // Pass amount in VND (no x100) to avoid displaying x100 on gateway
    const amount = Math.round(bill.totalAmount || 0);
    const url = vnpay.buildPaymentUrl(
      {
        vnp_Amount: amount,
        vnp_IpAddr: getClientIp(req),
        vnp_TxnRef: txnRef,
        vnp_ReturnUrl: returnUrl,
        vnp_OrderInfo: `Thanh toan hoa don ${txnRef}`,
      },
      {
        vnp_IpnUrl: ipnUrl,
        vnp_BankCode: undefined,
      }
    );

    res.json({ success: true, data: { paymentUrl: url } });
  } catch (error) {
    const msg = error?.code === 'VNP_CONFIG_MISSING' ? error.message : 'Cannot create payment';
    res.status(500).json({ success: false, message: msg, error: error.message });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    const vnpay = await getVNPayInstance();
    const verify = vnpay.verifyReturnUrl(req.query);
    const code = verify.vnp_ResponseCode || verify.vnpayResponseCode;
    const feBase = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const successUrl = feBase
      ? `${feBase}/main/payment-result?status=success&bill=${encodeURIComponent(
          req.query.vnp_TxnRef || ''
        )}`
      : '/main/payment-result?status=success';
    const failUrl = feBase
      ? `${feBase}/main/payment-result?status=failed&reason=${encodeURIComponent(
          code || 'unknown'
        )}`
      : '/main/payment-result?status=failed';
    if (verify.isSuccess && (code === '00' || code === 0)) {
      const billId = req.query.vnp_TxnRef;
      await BillService.markBillPaid(billId, { paymentMethod: 'vnpay' });
      return res.redirect(successUrl);
    }
    // Mark failed if return is not success
    if (req.query.vnp_TxnRef) {
      try {
        await require('../services/bill.service').updateBill?.(req.query.vnp_TxnRef, {
          status: 'failed',
        });
      } catch (_) {}
    }
    return res.redirect(failUrl);
  } catch (error) {
    const feBase = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const failUrl = feBase
      ? `${feBase}/main/payment-result?status=failed&reason=exception`
      : '/main/payment-result?status=failed';
    return res.redirect(failUrl);
  }
};

exports.vnpayIpn = async (req, res) => {
  try {
    const vnpay = await getVNPayInstance();
    const verified = vnpay.verifyIpnCall(req.query);
    if (!verified.isSuccess) {
      return res.json({ RspCode: '97', Message: 'Checksum failed' });
    }
    const code = verified.vnp_ResponseCode || verified.vnpayResponseCode;
    if (code === '00' || code === 0) {
      const billId = req.query.vnp_TxnRef;
      await BillService.markBillPaid(billId, { paymentMethod: 'vnpay' });
      return res.json({ RspCode: '00', Message: 'Confirm Success' });
    }
    return res.json({ RspCode: '01', Message: 'Payment failed' });
  } catch (error) {
    return res.json({ RspCode: '99', Message: 'Unknown error' });
  }
};
