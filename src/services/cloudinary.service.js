/**
 * @fileoverview Cloudinary Upload Service
 * @description Service for handling image uploads to Cloudinary
 */

const { cloudinary } = require('../config/cloudinary');
const logger = require('../utils/logger');

class CloudinaryService {
  /**
   * Upload single image to Cloudinary
   * @param {Buffer|String} file - File buffer or file path
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  static async uploadImage(file, options = {}) {
    try {
      const defaultOptions = {
        folder: 'stayhub/rooms', // Default folder
        resource_type: 'image',
        format: 'jpg', // Convert to jpg for consistency
        quality: 'auto:good', // Optimize quality
        transformation: [
          { width: 1200, height: 800, crop: 'limit' }, // Limit max size
          { quality: 'auto:good' },
          { fetch_format: 'auto' }, // Auto format (webp if supported)
        ],
      };

      const uploadOptions = { ...defaultOptions, ...options };

      let uploadResult;

      if (Buffer.isBuffer(file)) {
        // Upload from buffer
        uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(uploadOptions, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            })
            .end(file);
        });
      } else {
        // Upload from file path
        uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
      }

      logger.info('Image uploaded to Cloudinary:', {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
        size: uploadResult.bytes,
      });

      return {
        success: true,
        data: {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
          secure_url: uploadResult.secure_url,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          size: uploadResult.bytes,
          created_at: uploadResult.created_at,
        },
      };
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple images to Cloudinary
   * @param {Array} files - Array of files (buffers or paths)
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  static async uploadMultipleImages(files, options = {}) {
    try {
      const uploadPromises = files.map((file, index) => {
        const fileOptions = {
          ...options,
          public_id: options.public_id ? `${options.public_id}_${index + 1}` : undefined,
        };
        return this.uploadImage(file, fileOptions);
      });

      const results = await Promise.all(uploadPromises);

      logger.info(`Successfully uploaded ${results.length} images to Cloudinary`);

      return {
        success: true,
        data: results.map((result) => result.data),
      };
    } catch (error) {
      logger.error('Multiple images upload error:', error);
      throw new Error(`Multiple images upload failed: ${error.message}`);
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {String} publicId - Public ID of the image to delete
   * @returns {Promise<Object>} Delete result
   */
  static async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      logger.info('Image deleted from Cloudinary:', { public_id: publicId, result: result.result });

      return {
        success: result.result === 'ok',
        data: result,
      };
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  /**
   * Get image details from Cloudinary
   * @param {String} publicId - Public ID of the image
   * @returns {Promise<Object>} Image details
   */
  static async getImageDetails(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);

      return {
        success: true,
        data: {
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
          created_at: result.created_at,
        },
      };
    } catch (error) {
      logger.error('Get image details error:', error);
      throw new Error(`Failed to get image details: ${error.message}`);
    }
  }
}

module.exports = CloudinaryService;
