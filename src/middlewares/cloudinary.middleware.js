/**
 * @fileoverview Cloudinary Upload Middleware
 * @description Middleware for handling image uploads with Cloudinary
 */

const multer = require('multer');
const CloudinaryService = require('../services/cloudinary.service');
const logger = require('../utils/logger');

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
});

/**
 * Middleware to upload single image to Cloudinary
 * @param {String} fieldName - Name of the form field
 * @param {String} folder - Cloudinary folder (optional)
 */
const uploadSingleImage = (fieldName = 'image', folder = 'stayhub/rooms') => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file) {
          return next(); // No file uploaded, continue
        }

        logger.info('Uploading single image to Cloudinary:', {
          fieldName,
          filename: req.file.originalname,
          size: req.file.size,
        });

        // Upload to Cloudinary
        const result = await CloudinaryService.uploadImage(req.file.buffer, {
          folder: folder,
          public_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });

        // Add Cloudinary result to request
        req.cloudinaryResult = result.data;

        next();
      } catch (error) {
        logger.error('Single image upload middleware error:', error);
        res.status(400).json({
          success: false,
          message: 'Image upload failed',
          error: error.message,
        });
      }
    },
  ];
};

/**
 * Middleware to upload multiple images to Cloudinary
 * @param {String} fieldName - Name of the form field
 * @param {Number} maxCount - Maximum number of files
 * @param {String} folder - Cloudinary folder (optional)
 */
const uploadMultipleImages = (fieldName = 'images', maxCount = 10, folder = 'stayhub/rooms') => {
  return [
    upload.array(fieldName, maxCount),
    async (req, res, next) => {
      try {
        if (!req.files || req.files.length === 0) {
          return next(); // No files uploaded, continue
        }

        logger.info('Uploading multiple images to Cloudinary:', {
          fieldName,
          count: req.files.length,
          totalSize: req.files.reduce((sum, file) => sum + file.size, 0),
        });

        // Upload all files to Cloudinary
        const fileBuffers = req.files.map((file) => file.buffer);
        const result = await CloudinaryService.uploadMultipleImages(fileBuffers, {
          folder: folder,
        });

        // Add Cloudinary results to request
        req.cloudinaryResults = result.data;

        next();
      } catch (error) {
        logger.error('Multiple images upload middleware error:', error);
        res.status(400).json({
          success: false,
          message: 'Images upload failed',
          error: error.message,
        });
      }
    },
  ];
};

/**
 * Middleware to handle mixed form data with images
 * @param {Array} fields - Array of field configurations
 * @param {String} folder - Cloudinary folder (optional)
 */
const uploadMixedImages = (fields, folder = 'stayhub/rooms') => {
  return [
    upload.fields(fields),
    async (req, res, next) => {
      try {
        if (!req.files || Object.keys(req.files).length === 0) {
          return next(); // No files uploaded, continue
        }

        logger.info('Uploading mixed images to Cloudinary:', {
          fields: Object.keys(req.files),
          totalFiles: Object.values(req.files).reduce((sum, files) => sum + files.length, 0),
        });

        req.cloudinaryResults = {};

        // Process each field
        for (const [fieldName, files] of Object.entries(req.files)) {
          if (files.length === 1) {
            // Single file
            const result = await CloudinaryService.uploadImage(files[0].buffer, {
              folder: folder,
              public_id: `${fieldName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            });
            req.cloudinaryResults[fieldName] = result.data;
          } else {
            // Multiple files
            const fileBuffers = files.map((file) => file.buffer);
            const result = await CloudinaryService.uploadMultipleImages(fileBuffers, {
              folder: folder,
            });
            req.cloudinaryResults[fieldName] = result.data;
          }
        }

        next();
      } catch (error) {
        logger.error('Mixed images upload middleware error:', error);
        res.status(400).json({
          success: false,
          message: 'Images upload failed',
          error: error.message,
        });
      }
    },
  ];
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 10MB';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 10 files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = error.message;
    }

    return res.status(400).json({
      success: false,
      message: message,
      error: error.code,
    });
  }

  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed',
      error: 'INVALID_FILE_TYPE',
    });
  }

  next(error);
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  uploadMixedImages,
  handleUploadError,
};
