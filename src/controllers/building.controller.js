/**
 * @fileoverview Building Controller - Handles HTTP requests for building
 * @created 2025-05-29
 * @file building.controller.js
 * @description This controller manages building endpoints including CRUD operations.
 */

const { formatUserResponse } = require('../services/auth.service');
const BuildingService = require('../services/building.service');
const logger = require('../utils/logger');

/**
 * @route GET /api/buildings
 * @description Get all buildings
 * @returns {Object} Building data
 */
exports.getAllBuildings = async (req, res) => {
  try {
    const buildings = await BuildingService.getAllBuildings();
    res.status(200).json({
      success: true,
      message: 'Buildings retrieved successfully',
      data: buildings,
    });
  } catch (error) {
    logger.error('Error getting all buildings:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting all buildings',
      error: error.message,
    });
  }
};

/**
 * @route GET /api/buildings/:id
 * @description Get building by id
 * @param {string} id - Building id
 * @returns {Object} Building data
 */
exports.getBuildingById = async (req, res) => {
  try {
    const buildingId = req.params.id;
    const building = await BuildingService.getBuildingById(buildingId);
    return formatUserResponse(res, { message: 'Building retrieved successfully', data: building });
  } catch (error) {
    logger.error('Error getting building by id:', error);
    return formatUserResponse(
      res,
      {
        success: false,
        message: 'Error getting building by id',
        error: error.message,
      },
      500
    );
  }
};

/**
 * @route POST /api/buildings
 * @description Create a new building
 * @param {Object} req.body - Building data
 * @returns {Object} Building data
 */
exports.createBuilding = async (req, res) => {
  try {
    const building = await BuildingService.createBuilding(req.body);
    return formatUserResponse(res, { message: 'Building created successfully', data: building });
  } catch (error) {
    logger.error('Error creating building:', error);
    return formatUserResponse(
      res,
      {
        success: false,
        message: 'Error creating building',
        error: error.message,
      },
      500
    );
  }
};

/**
 * @route PUT /api/buildings/:id
 * @description Update a building
 * @param {string} id - Building id
 * @param {Object} req.body - Building data
 * @returns {Object} Building data
 */
