/**
 * Merma Project - Alert Routes
 * 
 * Alert endpoints for system notifications.
 * 
 * Version: 1.0.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AlertController } from '../controllers/alertController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const alertController = new AlertController();

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
// GET ALERTS ENDPOINT
// =============================================================================

/**
 * GET /api/alerts
 * 
 * Get all alerts for the authenticated user.
 * Auth: Bearer JWT required
 * Response: AlertResponse
 */
router.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      await alertController.getAlerts(req, res);
    } catch (error) {
      console.error('Error in getAlerts route:', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to fetch alerts',
      });
    }
  }
);

// =============================================================================
// ACKNOWLEDGE ALERT ENDPOINT
// =============================================================================

/**
 * POST /api/alerts/:id/acknowledge
 * 
 * Acknowledge a specific alert.
 * Auth: Bearer JWT required
 * Response: { success: boolean }
 */
router.post(
  '/:id/acknowledge',
  authMiddleware,
  [body('id').isInt({ min: 1 }).withMessage('alert ID must be a positive integer')],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const alertId = parseInt(req.params.id, 10);
      await alertController.acknowledgeAlert(req, res, alertId);
    } catch (error) {
      console.error('Error in acknowledgeAlert route:', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to acknowledge alert',
      });
    }
  }
);

export default router;
