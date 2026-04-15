/**
 * Alert Service - Routes
 * 
 * Defines API routes for alert endpoints
 * 
 * Version: 1.0.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getAlerts, acknowledgeAlert } from '../controllers/alertController.js';

const router = Router();

/**
 * GET /api/alerts
 * 
 * Retrieve all alerts for the authenticated user
 * 
 * Auth: Bearer JWT
 * Response: AlertResponse
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAlerts(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/alerts/:id/acknowledge
 * 
 * Acknowledge an alert by ID
 * 
 * Auth: Bearer JWT
 * Response: { success: boolean }
 */
router.post('/:id/acknowledge', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await acknowledgeAlert(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
