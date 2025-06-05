/**
 * @fileoverview Building Controller - Handles HTTP requests for building
 * @created 2025-05-29
 * @file building.controller.ts
 * @description This controller manages building endpoints including CRUD operations.
 */

import { Request, Response } from 'express';
import BuildingService from '../services/building.service';
import logger from '../utils/logger';

interface ResponseData {
  success?: boolean;
  message: string;
  data?: any;
  error?: string | null;
}

const formatResponse = (
  res: Response,
  { success = true, message, data = null, error = null }: ResponseData,
  status = 200
): Response => {
  return res
    .status(status)
    .json({ success, message, ...(data && { data }), ...(error && { error }) });
};

/**
 * @route GET /api/buildings
 * @description Get all buildings
 * @returns {Object} Building data
 */
export const getAllBuildings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const buildings = await BuildingService.getAllBuildings();
    return formatResponse(res, {
      success: true,
      message: 'Buildings retrieved successfully',
      data: buildings,
    });
  } catch (error) {
    logger.error('Error getting all buildings:', error);
    return formatResponse(
      res,
      {
        success: false,
        message: 'Error getting all buildings',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
};

/**
 * @route GET /api/buildings/:id
 * @description Get building by id
 * @param {string} id - Building id
 * @returns {Object} Building data
 */
export const getBuildingById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const buildingId = req.params.id;
    const building = await BuildingService.getBuildingById(buildingId);
    return formatResponse(res, {
      success: true,
      message: 'Building retrieved successfully',
      data: building,
    });
  } catch (error) {
    logger.error('Error getting building by id:', error);
    return formatResponse(
      res,
      {
        success: false,
        message: 'Error getting building by id',
        error: error instanceof Error ? error.message : 'Unknown error',
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
export const createBuilding = async (req: Request, res: Response): Promise<Response> => {
  try {
    const building = await BuildingService.createBuilding(req.body);
    return formatResponse(res, {
      success: true,
      message: 'Building created successfully',
      data: building,
    });
  } catch (error) {
    logger.error('Error creating building:', error);
    return formatResponse(
      res,
      {
        success: false,
        message: 'Error creating building',
        error: error instanceof Error ? error.message : 'Unknown error',
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
