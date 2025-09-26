/**
 * @fileoverview Image Management Service
 * @description Service for managing image lifecycle (create, update, delete)
 */

const CloudinaryService = require('./cloudinary.service');
const logger = require('../utils/logger');

class ImageService {
  /**
   * Delete old images when updating room/user
   * @param {Array} oldImages - Array of old image objects with public_id
   * @param {Array} newImages - Array of new image objects
   * @returns {Promise<void>}
   */
  static async replaceImages(oldImages = [], newImages = []) {
    try {
      // Extract public_ids from old images
      const oldPublicIds = oldImages.filter((img) => img.public_id).map((img) => img.public_id);

      // Delete old images from Cloudinary
      if (oldPublicIds.length > 0) {
        logger.info(`Deleting ${oldPublicIds.length} old images from Cloudinary`);

        const deletePromises = oldPublicIds.map((publicId) =>
          CloudinaryService.deleteImage(publicId).catch((error) => {
            logger.error(`Failed to delete image ${publicId}:`, error);
            return { success: false, publicId, error: error.message };
          })
        );

        const deleteResults = await Promise.all(deletePromises);

        const successful = deleteResults.filter((result) => result.success).length;
        const failed = deleteResults.filter((result) => !result.success).length;

        logger.info(`Image deletion results: ${successful} successful, ${failed} failed`);
      }

      return newImages;
    } catch (error) {
      logger.error('Error in replaceImages:', error);
      throw error;
    }
  }

  /**
   * Clean up orphaned images (images uploaded but not saved to database)
   * @param {Array} publicIds - Array of public_ids to delete
   * @returns {Promise<void>}
   */
  static async cleanupOrphanedImages(publicIds = []) {
    try {
      if (publicIds.length === 0) return;

      logger.info(`Cleaning up ${publicIds.length} orphaned images`);

      const deletePromises = publicIds.map((publicId) =>
        CloudinaryService.deleteImage(publicId).catch((error) => {
          logger.error(`Failed to cleanup image ${publicId}:`, error);
        })
      );

      await Promise.all(deletePromises);
      logger.info('Orphaned images cleanup completed');
    } catch (error) {
      logger.error('Error in cleanupOrphanedImages:', error);
    }
  }

  /**
   * Process mixed image updates (keep existing + add new + remove deleted)
   * @param {Array} currentImages - Current images in database
   * @param {Array} newUploadedImages - Newly uploaded images from Cloudinary
   * @param {Array} existingToKeep - Existing images to keep (URLs)
   * @returns {Promise<Array>} Final array of images
   */
  static async processImageUpdate(currentImages = [], newUploadedImages = [], existingToKeep = []) {
    try {
      // Filter existing images to keep
      const imagesToKeep = currentImages.filter((img) => existingToKeep.includes(img.url));

      // Images to delete (current images not in keep list)
      const imagesToDelete = currentImages.filter((img) => !existingToKeep.includes(img.url));

      // Delete unwanted images
      if (imagesToDelete.length > 0) {
        await this.replaceImages(imagesToDelete, []);
      }

      // Combine kept images with new uploaded images
      const finalImages = [...imagesToKeep, ...newUploadedImages];

      logger.info(
        `Image update processed: ${imagesToKeep.length} kept, ${newUploadedImages.length} new, ${imagesToDelete.length} deleted`
      );

      return finalImages;
    } catch (error) {
      logger.error('Error in processImageUpdate:', error);
      throw error;
    }
  }
}

module.exports = ImageService;
