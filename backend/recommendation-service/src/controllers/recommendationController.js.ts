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
import { RecommendationResponse, Recommendation } from '../../shared/models.js';

const recommendationService = new RecommendationService();

/**
 * Controller object exporting all recommendation endpoint handlers
 */
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
      // Get all active recommendations from the service
      const recommendations: Recommendation[] = await recommendationService.getAllRecommendations();
      
      // Build the response with timestamp
      const response: RecommendationResponse = {
        recommendations,
        generatedAt: new Date().toISOString(),
      };
      
      // Return successful response
      res.status(200).json(response);
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching recommendations:', error);
      
      // Pass error to Express error handler
      next(error);
    }
  },

  /**
   * GET /api/recommendations/:id
   * 
   * Retrieve a specific recommendation by ID.
   * Used for retrieving detailed recommendation information.
   * 
   * @param req - Express request object with recommendation ID in params
   * @param res - Express response object
   * @param next - Express next function
   */
  async getRecommendationById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recommendationId = parseInt(req.params.id, 10);
      
      // Validate the recommendation ID
      if (isNaN(recommendationId) || recommendationId <= 0) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid recommendation ID format',
        });
        return;
      }
      
      // Get recommendation by ID from the service
      const recommendation = await recommendationService.getRecommendationById(recommendationId);
      
      // Return 404 if recommendation not found
      if (!recommendation) {
        res.status(404).json({
          error: 'NotFound',
          message: 'Recommendation not found',
        });
        return;
      }
      
      // Return successful response
      res.status(200).json(recommendation);
    } catch (error) {
      console.error('Error fetching recommendation by ID:', error);
      next(error);
    }
  },

  /**
   * POST /api/recommendations/refresh
   * 
   * Refresh recommendations by recalculating all recommendations.
   * This endpoint triggers a fresh analysis of inventory and demand data.
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  async refreshRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Check if user has admin or manager role for this action
      if (req.user && !['admin', 'manager'].includes(req.user.role)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions to refresh recommendations',
        });
        return;
      }
      
      // Refresh all recommendations through the service
      const recommendations: Recommendation[] = await recommendationService.refreshRecommendations();
      
      // Build the response with timestamp
      const response: RecommendationResponse = {
        recommendations,
        generatedAt: new Date().toISOString(),
      };
      
      // Return successful response
      res.status(200).json(response);
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      next(error);
    }
  },

  /**
   * GET /api/recommendations/action/:action
   * 
   * Retrieve recommendations filtered by action type.
   * Useful for filtering recommendations by specific actions like 'order_more' or 'promote_sale'.
   * 
   * @param req - Express request object with action type in params
   * @param res - Express response object
   * @param next - Express next function
   */
  async getRecommendationsByAction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const action = req.params.action as string;
      
      // Validate the action parameter
      const validActions = ['order_more', 'reduce_stock', 'promote_sale', 'monitor'];
      if (!validActions.includes(action)) {
        res.status(400).json({
          error: 'ValidationError',
          message: `Invalid action type. Must be one of: ${validActions.join(', ')}`,
        });
        return;
      }
      
      // Get recommendations filtered by action from the service
      const recommendations: Recommendation[] = await recommendationService.getRecommendationsByAction(action);
      
      // Build the response with timestamp
      const response: RecommendationResponse = {
        recommendations,
        generatedAt: new Date().toISOString(),
      };
      
      // Return successful response
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching recommendations by action:', error);
      next(error);
    }
  },
};

export default recommendationController;
