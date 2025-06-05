/**
 * @fileoverview Building Service - Handles building operations
 * @created 2025-05-29
 * @file building.service.ts
 * @description Service for managing building data and operations
 */

import Building from '../models/building.model';
import logger from '../utils/logger';
import { NotFoundError, ValidationError } from '../utils/errors';

interface BuildingData {
  name: string;
  location?: string;
  status?: string;
  [key: string]: any;
}

interface SearchCriteria {
  name?: string;
  location?: string;
  [key: string]: any;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
}

interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface BuildingsResponse {
  buildings: BuildingData[];
  pagination: PaginationResult;
}

interface BuildingStats {
  totalBuildings: number;
  activeBuildings: number;
  inactiveBuildings: number;
}

/**
 * @class BuildingService
 * @classdesc Service class for handling building operations
 */
class BuildingService {
  /**
   * @route GET /api/buildings
   * @description Get all buildings with pagination and filters
   * @param options - Query options
   * @returns Buildings data with pagination
   */
  static async getAllBuildings({
    page = 1,
    limit = 10,
    filters = {},
  }: PaginationOptions = {}): Promise<BuildingsResponse> {
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
   * @param buildingId - Building id
   * @returns Building data
   * @throws {NotFoundError} If building not found
   */
  static async getBuildingById(buildingId: string): Promise<BuildingData> {
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
   * @param buildingData - Building data
   * @returns Created building
   */
  static async createBuilding(buildingData: BuildingData): Promise<BuildingData> {
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
   * @param buildingId - Building id
   * @param updateData - Update data
   * @returns Updated building
   * @throws {NotFoundError} If building not found
   */
  static async updateBuilding(
    buildingId: string,
    updateData: Partial<BuildingData>
  ): Promise<BuildingData> {
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
   * @param buildingId - Building id
   * @throws {NotFoundError} If building not found
   */
  static async deleteBuilding(buildingId: string): Promise<void> {
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
   * @param searchCriteria - Search criteria
   * @returns Matching buildings
   */
  static async searchBuildings(searchCriteria: SearchCriteria): Promise<BuildingData[]> {
    try {
      const query: Record<string, any> = {};

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
   * @returns Building statistics
   */
  static async getBuildingStats(): Promise<BuildingStats> {
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

export default BuildingService;
