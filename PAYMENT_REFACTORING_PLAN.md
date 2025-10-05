# 🔄 Payment System Refactoring Plan
## From VNPAY to Manual Bank Transfer Verification

---

## 📊 PART 1: CURRENT SYSTEM ANALYSIS

### 🗂️ Files Identified with VNPAY Logic

#### **1. Core Payment Files** (TO BE MODIFIED)
```
src/controllers/payment.controller.js    ✏️ REPLACE
src/routes/payment.routes.js             ✏️ REPLACE
src/services/bill.service.js             ✏️ UPDATE (partial)
src/models/bill.model.js                 ✏️ UPDATE (add fields)
src/models/booking.model.js              ✏️ UPDATE (add fields)
```

#### **2. VNPAY-Specific Files** (TO BE DELETED)
```
src/vnpay/                               🗑️ DELETE ENTIRE FOLDER
├── vnpay.js
├── index.js
├── package.json
├── constants/
│   ├── api-endpoint.constant.js
│   ├── ipn-result-for-vnpay.constant.js
│   ├── regex.constant.js
│   └── response-map.constant.js
├── enums/
│   ├── index.js
│   └── product-code.enum.js
├── services/
│   ├── payment.service.js
│   ├── query.service.js
│   ├── verification.service.js
│   └── logger.service.js
└── utils/
    ├── common.js
    ├── payment.util.js
    ├── logger.js
    └── index.js
```

#### **3. Environment Variables** (TO BE REMOVED)
```env
# ❌ Remove these from .env:
VNP_TMN_CODE
VNPAY_TMN_CODE
VNP_HASH_SECRET
VNP_HOST
VNP_TEST_MODE
VNP_HASH_ALG
```

---

## 📋 PART 2: DETAILED FILE ANALYSIS

### **File: `src/controllers/payment.controller.js`**

#### ❌ FUNCTIONS TO REMOVE:
1. **`getVNPayInstance()`** (Lines 14-39)
   - Creates VNPay SDK instance
   - Validates environment variables
   - Dynamic import of vnpay module

2. **`createVNPayPayment()`** (Lines 41-79)
   - Generates VNPay payment URL
   - Builds payment parameters
   - Returns redirect URL to VNPay gateway

3. **`vnpayReturn()`** (Lines 81-117)
   - Handles return from VNPay gateway
   - Verifies payment signature
   - Redirects to frontend success/failure page

4. **`vnpayIpn()`** (Lines 119-137)
   - Handles IPN callback from VNPay
   - Verifies payment completion
   - Updates bill status

#### ✅ WHAT TO ADD:
1. **`uploadPaymentEvidence()`**
   - Upload payment proof image (bank transfer screenshot)
   - Create/update payment record with evidence
   - Set status to 'pending_approval'

2. **`getPaymentEvidence()`**
   - Retrieve payment evidence details
   - Display image URL for landlord review

3. **`approvePayment()`** (Landlord only)
   - Approve payment evidence
   - Mark bill as 'paid'
   - Send confirmation email

4. **`rejectPayment()`** (Landlord only)
   - Reject payment evidence
   - Request renter to resubmit
   - Send rejection notification

5. **`getPaymentsByStatus()`**
   - Get all payments by approval status
   - For landlord dashboard

---

### **File: `src/routes/payment.routes.js`**

#### ❌ ROUTES TO REMOVE:
```javascript
router.get('/vnpay/create', auth, createVNPayPayment);
router.get('/vnpay/return', vnpayReturn);
router.get('/vnpay/ipn', vnpayIpn);
```

#### ✅ NEW ROUTES TO ADD:
```javascript
// Renter uploads payment evidence
router.post('/upload-evidence', auth, uploadMiddleware, uploadPaymentEvidence);

// Get payment details with evidence
router.get('/:paymentId', auth, getPaymentEvidence);

// Landlord approves payment
router.put('/:paymentId/approve', auth, restrictTo('landlord'), approvePayment);

// Landlord rejects payment
router.put('/:paymentId/reject', auth, restrictTo('landlord'), rejectPayment);

// Get payments by status (for landlord dashboard)
router.get('/status/:status', auth, restrictTo('landlord'), getPaymentsByStatus);

// Renter gets own payment history
router.get('/my-payments', auth, getMyPayments);
```

---

### **File: `src/models/bill.model.js`**

#### ✅ FIELDS TO ADD:
```javascript
{
  // ... existing fields ...
  
  // NEW FIELDS FOR MANUAL VERIFICATION
  paymentEvidence: {
    type: String,  // URL to uploaded image
    default: null,
  },
  
  approvalStatus: {
    type: String,
    enum: ['pending', 'pending_approval', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Landlord who reviewed
  },
  
  reviewedAt: {
    type: Date,
  },
  
  rejectionReason: {
    type: String,
    maxLength: 500,
  },
  
  evidenceUploadedAt: {
    type: Date,
  },
  
  // Keep paymentMethod but change values
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'momo', 'other'],
    default: 'bank_transfer',
  },
}
```

#### ✏️ FIELD MODIFICATIONS:
```javascript
// Update status enum to include new states
status: {
  type: String,
  enum: ['pending', 'pending_approval', 'paid', 'overdue', 'failed', 'rejected'],
  default: 'pending',
  index: true,
}
```

---

### **File: `src/models/booking.model.js`**

#### ✅ FIELDS TO ADD:
```javascript
{
  // ... existing fields ...
  
  // Deposit payment evidence
  depositEvidence: {
    type: String,  // URL to uploaded image
  },
  
  depositApprovalStatus: {
    type: String,
    enum: ['pending', 'pending_approval', 'approved', 'rejected'],
    default: 'pending',
  },
  
  depositReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  depositReviewedAt: {
    type: Date,
  },
}
```

---

### **File: `src/services/bill.service.js`**

#### ✏️ FUNCTION TO MODIFY:
```javascript
// Current function:
static async markBillPaid(billId, { paymentMethod = 'vnpay' } = {})

// Update to:
static async markBillPaid(billId, { 
  paymentMethod = 'bank_transfer',
  reviewedBy = null,
  approvalStatus = 'approved'
} = {})
```

#### ✅ NEW FUNCTIONS TO ADD:
```javascript
static async uploadPaymentEvidence(billId, evidenceUrl, renterId) {
  // Update bill with payment evidence
  // Set status to 'pending_approval'
  // Set evidenceUploadedAt timestamp
  // Notify landlord
}

static async approvePayment(billId, landlordId, notes) {
  // Verify landlord owns the property
  // Mark bill as paid
  // Set approvalStatus to 'approved'
  // Set reviewedBy and reviewedAt
  // Send confirmation email to renter
}

static async rejectPayment(billId, landlordId, reason) {
  // Verify landlord owns the property
  // Set approvalStatus to 'rejected'
  // Set rejectionReason
  // Notify renter to resubmit
}

static async getPaymentsByApprovalStatus(landlordId, status) {
  // Get all payments pending approval for landlord's properties
  // Join with Contract and Room to verify ownership
}
```

---

## 🗄️ PART 3: NEW DATABASE SCHEMA

### **Updated Bill Schema**
```javascript
const BillSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
    index: true,
  },
  renterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  landlordId: {  // ✅ NEW: For easier queries
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  amount: {
    rent: { type: Number, min: 0, default: 0 },
    electricity: { type: Number, min: 0, default: 0 },
    water: { type: Number, min: 0, default: 0 },
    service: { type: Number, min: 0, default: 0 },
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  note: {
    type: String,
    maxLength: 2000,
  },
  type: {
    type: String,
    enum: ['monthly', 'one-time', 'deposit', 'refund'],
    default: 'monthly',
    index: true,
  },
  month: { type: Number, min: 1, max: 12 },
  year: { type: Number, min: 2020, max: 3000 },
  
  // ✅ PAYMENT STATUS
  status: {
    type: String,
    enum: ['pending', 'pending_approval', 'paid', 'overdue', 'failed', 'rejected'],
    default: 'pending',
    index: true,
  },
  
  // ✅ PAYMENT EVIDENCE
  paymentEvidence: {
    type: String,  // Cloudinary URL or file path
    default: null,
  },
  evidenceUploadedAt: {
    type: Date,
  },
  
  // ✅ APPROVAL WORKFLOW
  approvalStatus: {
    type: String,
    enum: ['pending', 'pending_approval', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Landlord
  },
  reviewedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    maxLength: 500,
  },
  
  // ✅ PAYMENT METHOD
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'momo', 'other'],
    default: 'bank_transfer',
  },
  
  paidAt: Date,
  dueDate: Date,
}, {
  timestamps: true,
});

// ✅ NEW INDEXES
BillSchema.index({ landlordId: 1, approvalStatus: 1 });
BillSchema.index({ renterId: 1, status: 1 });
BillSchema.index({ approvalStatus: 1, createdAt: -1 });
```

---

## 🔄 PART 4: WORKFLOW COMPARISON

### **OLD WORKFLOW (VNPAY)**
```
1. Renter clicks "Pay Bill"
   ↓
2. Backend creates VNPay payment URL
   ↓
3. User redirects to VNPay gateway
   ↓
4. User enters card/bank info on VNPay
   ↓
5. VNPay processes payment
   ↓
6. VNPay redirects back to app (vnpay/return)
   ↓
7. Backend verifies signature
   ↓
8. Bill marked as 'paid' automatically
   ↓
9. VNPay sends IPN callback for confirmation
```

### **NEW WORKFLOW (MANUAL VERIFICATION)**
```
1. Renter receives bill notification
   ↓
2. Renter transfers money to landlord's bank account
   ↓
3. Renter takes screenshot of transfer
   ↓
4. Renter uploads evidence via API
   ↓
5. Backend stores image URL in Bill.paymentEvidence
   ↓
6. Bill status → 'pending_approval'
   ↓
7. Landlord receives notification
   ↓
8. Landlord reviews evidence in dashboard
   ↓
9a. APPROVE → Bill.status = 'paid', send confirmation
9b. REJECT → Bill.status = 'rejected', renter resubmits
```

---

## 📦 PART 5: REQUIRED MIDDLEWARE

### **File Upload Middleware**
```javascript
// src/middlewares/upload.middleware.js

const multer = require('multer');
const path = require('path');

// Option 1: Store locally then upload to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpg, png) and PDF are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter,
});

module.exports = upload;
```

### **Role-Based Access Control**
```javascript
// src/middlewares/restrictTo.js

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

module.exports = { restrictTo };
```

---

## 🎯 PART 6: IMPLEMENTATION CHECKLIST

### **Phase 1: Database & Models**
- [ ] Update `bill.model.js` with new fields
- [ ] Update `booking.model.js` with deposit evidence fields
- [ ] Create database migration script (optional)
- [ ] Add new indexes for performance

### **Phase 2: Remove VNPAY**
- [ ] Delete `/src/vnpay/` folder entirely
- [ ] Remove VNPAY routes from `payment.routes.js`
- [ ] Remove VNPAY controller functions
- [ ] Remove VNPAY environment variables
- [ ] Clean up any VNPAY imports in other files

### **Phase 3: File Upload Setup**
- [ ] Create `upload.middleware.js`
- [ ] Configure Cloudinary (already exists)
- [ ] Test image upload to Cloudinary
- [ ] Add file size and type validation

### **Phase 4: New Controllers**
- [ ] Implement `uploadPaymentEvidence()`
- [ ] Implement `getPaymentEvidence()`
- [ ] Implement `approvePayment()`
- [ ] Implement `rejectPayment()`
- [ ] Implement `getPaymentsByStatus()`

### **Phase 5: Services**
- [ ] Update `BillService.markBillPaid()`
- [ ] Add `BillService.uploadPaymentEvidence()`
- [ ] Add `BillService.approvePayment()`
- [ ] Add `BillService.rejectPayment()`
- [ ] Add authorization checks (verify landlord owns property)

### **Phase 6: Routes**
- [ ] Add new payment routes
- [ ] Add file upload middleware to routes
- [ ] Add role-based access control
- [ ] Test all endpoints with Postman

### **Phase 7: Email Notifications**
- [ ] Email template: Payment evidence uploaded (to landlord)
- [ ] Email template: Payment approved (to renter)
- [ ] Email template: Payment rejected (to renter)

### **Phase 8: Testing & Documentation**
- [ ] Write API documentation
- [ ] Create Postman collection
- [ ] Test complete workflow
- [ ] Update frontend integration guide

---

## 📝 PART 7: MIGRATION NOTES

### **Breaking Changes**
⚠️ **WARNING**: This is a breaking change that affects:
1. Existing frontend payment flow
2. Any pending VNPay payments will fail
3. Database schema changes

### **Migration Strategy**
```javascript
// migration-script.js
// Run this to update existing bills

const Bill = require('./models/bill.model');

async function migrateBills() {
  // Add landlordId to existing bills
  const bills = await Bill.find({ landlordId: { $exists: false } })
    .populate({
      path: 'contractId',
      populate: { path: 'roomId', populate: 'buildingId' }
    });
  
  for (const bill of bills) {
    if (bill.contractId?.roomId?.buildingId?.ownerId) {
      bill.landlordId = bill.contractId.roomId.buildingId.ownerId;
      await bill.save();
    }
  }
  
  console.log(`Migrated ${bills.length} bills`);
}
```

---

## 🚀 PART 8: NEXT STEPS

1. **Review this document** with your team
2. **Backup database** before making changes
3. **Create feature branch**: `git checkout -b feature/manual-payment-verification`
4. **Follow implementation checklist** phase by phase
5. **Test thoroughly** before merging to main
6. **Update frontend** to match new API endpoints
7. **Deploy to staging** first, then production

---

## 📚 PART 9: ADDITIONAL RESOURCES

### **Cloudinary Integration**
Already exists in your codebase:
- `src/config/cloudinary.js`
- `src/services/cloudinary.service.js`
- `src/middlewares/cloudinary.middleware.js`

### **Example Usage in Controller**
```javascript
const cloudinary = require('../services/cloudinary.service');

exports.uploadPaymentEvidence = async (req, res) => {
  try {
    const { billId } = req.body;
    const file = req.file;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'payment-evidence',
      resource_type: 'image',
    });
    
    // Save URL to database
    const bill = await BillService.uploadPaymentEvidence(
      billId,
      result.secure_url,
      req.user.id
    );
    
    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

**Ready to start implementation? Follow the checklist step by step! 🎯**