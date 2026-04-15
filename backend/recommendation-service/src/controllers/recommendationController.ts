/**
 * Merma Project - Recommendation Controller
 * 
 * HTTP request handlers for recommendation endpoints.
 * Handles request/response processing and delegates to services.
 * 
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendationService.js';
import { RecommendationResponse } from '../../shared/models.js';

const recommendationService = new RecommendationService();

export const recommendationController = {
  /**
   * GET /api/recommendations
   * 
   * Retrieve all active recommendations for inventory optimization.
   * Returns recommendations based on inventory levels, expiration dates,
   * and demand predictions.
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async getRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recommendations = await recommendationService.getAllRecommendations();
      
      const response: RecommendationResponse = {
        recommendations,
        generatedAt: new Date().toISOString(),
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
