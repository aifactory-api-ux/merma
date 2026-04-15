/**
 * Merma Project - Recommendation Routes
 * 
 * API route definitions for the recommendation service.
 * Defines endpoints for retrieving inventory recommendations.
 * 
 * Version: 1.0.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import { recommendationController } from '../controllers/recommendationController.js';

const router = Router();

/**
 * GET /api/recommendations
 * 
 * Retrieve all active recommendations for inventory optimization.
 * 
 * Auth: Bearer JWT required
 * 
 * Response: RecommendationResponse
 * {
 *   recommendations: Recommendation[],
 *   generatedAt: string (ISO8601)
 * }
 */
router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    recommendationController.getRecommendations(req, res, next);
  }
);

export default router;
