/**
 * Merma Project - Prediction Routes
 * 
 * Prediction endpoints for demand forecasting.
 * 
 * Version: 1.0.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PredictionController } from '../controllers/predictionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const predictionController = new PredictionController();

// =============================================================================
// VALIDATION MIDDLEWARE
// =============================================================================

/**
 * Validate request and return errors if validation fails
 */
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'ValidationError',
      message: errors.array()[0].msg,
    });
    return;
  }
  next();
};

// =============================================================================
// GET DEMAND PREDICTIONS ENDPOINT
// =============================================================================

/**
 * GET /api/predictions/demand
 * 
 * Get demand predictions for inventory items.
 * Query params: date (optional, YYYY-MM-DD format)
 * Auth: Bearer JWT required
 * Response: DemandPredictionResponse
 */
router.get(
  '/demand',
  authMiddleware,
  [
    query('date')
      .optional()
      .isISO8601()
      .withMessage('date must be in YYYY-MM-DD format'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string | undefined;
      await predictionController.getDemandPredictions(req, res, date);
    } catch (error) {
      console.error('Error in getDemandPredictions route:', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to fetch demand predictions',
      });
    }
  }
);

export default router;
