# 🐛 Bug Fix - Approve/Reject Payment 500 Error

## Problem
When trying to approve or reject payments, the server returns a 500 Internal Server Error.

## Root Cause
The code was checking for `building.ownerId` but the Building model uses `building.hostId`.

**Error Location:**
- `src/services/bill.service.js` line 335 (approvePayment)
- `src/services/bill.service.js` line 420 (rejectPayment)

## Fix Applied

### Changed in `src/services/bill.service.js`:

**Before:**
```javascript
const building = bill.contractId?.roomId?.buildingId;
if (!building || building.ownerId.toString() !== landlordId.toString()) {
  throw new ValidationError('You are not authorized to approve this payment');
}
```

**After:**
```javascript
const building = bill.contractId?.roomId?.buildingId;
if (!building || building.hostId.toString() !== landlordId.toString()) {
  throw new ValidationError('You are not authorized to approve this payment');
}
```

### Also Updated `migrate-bills.js`:

**Before:**
```javascript
select: 'ownerId'
// ...
const landlordId = bill.contractId?.roomId?.buildingId?.ownerId;
```

**After:**
```javascript
select: 'hostId'
// ...
const landlordId = bill.contractId?.roomId?.buildingId?.hostId;
```

## Testing

### 1. Restart Server
```bash
npm run dev
```

### 2. Test Approve Payment
```bash
PUT http://localhost:5000/api/payments/{billId}/approve
Authorization: Bearer {landlordToken}
Content-Type: application/json

{
  "notes": "Payment confirmed"
}
```

**Expected:** 200 OK ✅

### 3. Test Reject Payment
```bash
PUT http://localhost:5000/api/payments/{billId}/reject
Authorization: Bearer {landlordToken}
Content-Type: application/json

{
  "reason": "Incorrect amount"
}
```

**Expected:** 200 OK ✅

## Status
✅ **FIXED** - Ready for testing

---

**Date:** October 5, 2025  
**Fixed By:** AI Assistant  
**Time to Fix:** 5 minutes
