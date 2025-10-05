/**
 * @fileoverview Upload Middleware - Handles file uploads
 * @created 2025-09-25
 * @file upload.middleware.js
 * @description Middleware for handling multipart/form-data uploads
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter for payment evidence (images and PDF)
const paymentEvidenceFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/');
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png) and PDF files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
  },
});

// Middleware for room uploads (multiple images)
const uploadRoomImages = upload.array('images', 10);

// Configure multer for payment evidence (accepts images and PDF)
const uploadPaymentConfig = multer({
  storage: storage,
  fileFilter: paymentEvidenceFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware for single payment evidence upload
const uploadPaymentEvidence = uploadPaymentConfig.single('paymentEvidence');

// Wrapper middleware with error handling
const handleUpload = (req, res, next) => {
  uploadRoomImages(req, res, (err) => {
    if (err) {
      logger.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message,
      });
    }

    // Log uploaded files
    if (req.files && req.files.length > 0) {
      logger.info(
        'Files uploaded:',
        req.files.map((f) => f.filename)
      );
    }

    next();
  });
};

// Wrapper middleware for payment evidence with error handling
const handlePaymentEvidenceUpload = (req, res, next) => {
  uploadPaymentEvidence(req, res, (err) => {
    if (err) {
      logger.error('Payment evidence upload error:', err);
      return res.status(400).json({
        success: false,
        message: 'Payment evidence upload error',
        error: err.message,
      });
    }

    if (req.file) {
      logger.info('Payment evidence uploaded:', req.file.filename);
    }

    next();
  });
};

module.exports = {
  handleUpload,
  uploadRoomImages,
  handlePaymentEvidenceUpload,
  uploadPaymentEvidence,
};
