/**
 * @fileoverview Building Controller - Handles HTTP requests for building
 * @created 2025-05-29
 * @file building.controller.js
 * @description This controller manages building endpoints including CRUD operations.
 */

const BuildingService = require('../services/building.service');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const Room = require('../models/room.model');

/**
 * @route GET /api/buildings
 * @description Get all buildings (supports filtering by hostId, status, city, etc.)
 * @query page, limit, hostId, status, city, district, ward
 * @returns {Object} Building data
 */
exports.getAllBuildings = async (req, res) => {
  try {
    const { page = 1, limit = 10, hostId, status, city, district, ward, ...rest } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const filters = {};
    if (hostId) filters.hostId = hostId;
    if (status && status !== 'all') filters.status = status;
    if (city) filters['address.city'] = city;
    if (district) filters['address.district'] = district;
    if (ward) filters['address.ward'] = ward;

    // Attach any other primitive filters passed in (defensive; avoid pagination keys)
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        filters[key] = value;
      }
    });

    const buildings = await BuildingService.getAllBuildings({
      page: pageNum,
      limit: limitNum,
      filters,
    });

    res.status(200).json({
      success: true,
      message: 'Buildings retrieved successfully',
      data: buildings,
    });
    logger.info('Buildings retrieved successfully', {
      total: buildings?.pagination?.total ?? 0,
      filters,
    });
  } catch (error) {
    logger.error('Error getting all buildings:', { error: error.message, stack: error.stack });
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
    logger.info('Getting building by ID', { buildingId });

    if (!buildingId) {
      return res.status(400).json({ success: false, message: 'Building ID is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(buildingId)) {
      return res.status(400).json({ success: false, message: 'Invalid building ID format' });
    }

    const building = await BuildingService.getBuildingById(buildingId);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    logger.info('Building found', { buildingId, status: building?.status });

    return res.status(200).json({
      success: true,
      message: 'Building retrieved successfully',
      data: building,
    });
  } catch (error) {
    logger.error('Error getting building by id', {
      error: error.message,
      stack: error.stack,
      buildingId: req.params.id,
    });
    return res.status(500).json({
      success: false,
      message: 'Error getting building by id',
      error: error.message,
    });
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
    res.status(201).json({
      success: true,
      message: 'Building created successfully',
      data: building,
    });
  } catch (error) {
    logger.error('Error creating building:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error creating building',
      error: error.message,
    });
  }
};

/**
 * @route PUT /api/buildings/:id
 * @description Update a building
 * @param {string} id - Building id
 * @param {Object} req.body - Building data
 * @returns {Object} Building data
 */
exports.updateBuilding = async (req, res) => {
  try {
    const buildingId = req.params.id;

    if (!buildingId) {
      return res.status(400).json({ success: false, message: 'Building ID is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(buildingId)) {
      return res.status(400).json({ success: false, message: 'Invalid building ID format' });
    }

    const building = await BuildingService.updateBuilding(buildingId, req.body);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Building updated successfully',
      data: building,
    });
  } catch (error) {
    logger.error('Error updating building:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error updating building',
      error: error.message,
    });
  }
};

/**
 * @route DELETE /api/buildings/:id
 * @description Delete a building
 * @param {string} id - Building id
 * @returns {Object} Building data
 */
exports.deleteBuilding = async (req, res) => {
  try {
    const buildingId = req.params.id;

    if (!buildingId) {
      return res.status(400).json({ success: false, message: 'Building ID is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(buildingId)) {
      return res.status(400).json({ success: false, message: 'Invalid building ID format' });
    }

    const building = await BuildingService.deleteBuilding(buildingId);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Building deleted successfully',
      data: building,
    });
  } catch (error) {
    logger.error('Error deleting building:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error deleting building',
      error: error.message,
    });
  }
};

/**
 * @route GET /api/buildings/:id/rooms
 * @description Get all rooms of a building
 * @param {string} id - Building ID
 * @returns {Object} Rooms data
 */
exports.getRoomsByBuildingId = async (req, res) => {
  try {
    const buildingId = req.params.id;
    logger.info('Getting rooms by building ID', { buildingId });

    if (!buildingId) {
      return res.status(400).json({ success: false, message: 'Building ID is required' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(buildingId)) {
      return res.status(400).json({ success: false, message: 'Invalid building ID format' });
    }

    const rooms = await Room.find({ buildingId }).lean();
    return res.status(200).json({
      success: true,
      message: 'Rooms retrieved successfully',
      data: rooms,
    });
  } catch (error) {
    logger.error('Error getting rooms by building ID:', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: 'Error getting rooms by building ID',
      error: error.message,
    });
  }
};
