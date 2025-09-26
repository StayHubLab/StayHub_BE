const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const { createVNPayPayment, vnpayReturn, vnpayIpn } = require('../controllers/payment.controller');

router.get('/vnpay/create', auth, createVNPayPayment);
router.get('/vnpay/return', vnpayReturn);
router.get('/vnpay/ipn', vnpayIpn);

module.exports = router;
