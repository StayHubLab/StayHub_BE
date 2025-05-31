/**
 * @fileoverview Building Service - Handles building operations
 * @created 2025-05-29
 * @file building.service.js
 * @description Service for managing building data and operations
 */

const Building = require('../models/building.model');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * @class BuildingService
 * @classdesc Service class for handling building operations
 */
class BuildingService {
  /**
   * @route GET /api/buildings
   * @description Get all buildings with pagination and filters
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {Object} options.filters - Filter criteria
   * @returns {Promise<Object>} Buildings data with pagination
   */
  static async getAllBuildings({ page = 1, limit = 10, filters = {} } = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = Building.find(filters);

      const [buildings, total] = await Promise.all([
        query.skip(skip).limit(limit).lean(),
        Building.countDocuments(filters),
      ]);

      return {
        buildings,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting all buildings:', error);
      throw error;
    }
  }

  /**
   * @route GET /api/buildings/:id
   * @description Get building by id
   * @param {string} buildingId - Building id
   * @returns {Promise<Object>} Building data
   * @throws {NotFoundError} If building not found
   */
  static async getBuildingById(buildingId) {
    try {
      if (!buildingId) {
        throw new ValidationError('Building ID is required');
      }

      const building = await Building.findById(buildingId).lean();

      if (!building) {
        throw new NotFoundError(`Building with id ${buildingId} not found`);
      }

      return building;
    } catch (error) {
      logger.error('Error getting building by id:', error);
      throw error;
    }
  }

  /**
   * @route POST /api/buildings
   * @description Create a new building
   * @param {Object} buildingData - Building data
   * @returns {Promise<Object>} Created building
   */
  static async createBuilding(buildingData) {
    try {
      if (!buildingData) {
        throw new ValidationError('Building data is required');
      }

      const building = new Building(buildingData);
      await building.save();

      return building.toObject();
    } catch (error) {
      logger.error('Error creating building:', error);
      throw error;
    }
  }

  /**
   * @route PUT /api/buildings/:id
   * @description Update a building
   * @param {string} buildingId - Building id
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated building
   * @throws {NotFoundError} If building not found
   */
  static async updateBuilding(buildingId, updateData) {
    try {
      if (!buildingId) {
        throw new ValidationError('Building ID is required');
      }

      const building = await Building.findByIdAndUpdate(
        buildingId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).lean();

      if (!building) {
        throw new NotFoundError(`Building with id ${buildingId} not found`);
      }

      return building;
    } catch (error) {
      logger.error('Error updating building:', error);
      throw error;
    }
  }

  /**
   * @route DELETE /api/buildings/:id
   * @description Delete a building
   * @param {string} buildingId - Building id
   * @returns {Promise<void>}
   * @throws {NotFoundError} If building not found
   */
  static async deleteBuilding(buildingId) {
    try {
      if (!buildingId) {
        throw new ValidationError('Building ID is required');
      }

      const building = await Building.findByIdAndDelete(buildingId);

      if (!building) {
        throw new NotFoundError(`Building with id ${buildingId} not found`);
      }
    } catch (error) {
      logger.error('Error deleting building:', error);
      throw error;
    }
  }

  /**
   * @route GET /api/buildings/search
   * @description Search buildings by criteria
   * @param {Object} searchCriteria - Search criteria
   * @returns {Promise<Array>} Matching buildings
   */
  static async searchBuildings(searchCriteria) {
    try {
      const query = {};

      if (searchCriteria.name) {
        query.name = { $regex: searchCriteria.name, $options: 'i' };
      }

      if (searchCriteria.location) {
        query.location = { $regex: searchCriteria.location, $options: 'i' };
      }

      const buildings = await Building.find(query).lean();
      return buildings;
    } catch (error) {
      logger.error('Error searching buildings:', error);
      throw error;
    }
  }

  /**
   * @route GET /api/buildings/stats
   * @description Get building statistics
   * @returns {Promise<Object>} Building statistics
   */
  static async getBuildingStats() {
    try {
      const [totalBuildings, activeBuildings] = await Promise.all([
        Building.countDocuments(),
        Building.countDocuments({ status: 'active' }),
      ]);

      return {
        totalBuildings,
        activeBuildings,
        inactiveBuildings: totalBuildings - activeBuildings,
      };
    } catch (error) {
      logger.error('Error getting building stats:', error);
      throw error;
    }
  }
}

module.exports = BuildingService;
