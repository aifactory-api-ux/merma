/**
 * Merma Project - Alert Routes
 * 
 * API routes for alert service.
 * Provides endpoints for getting and acknowledging alerts.
 * 
 * Version: 1.0.0
 */

import { Router, Request, Response } from 'express';
import { AlertController } from '../controllers/alertController.js';

// Create router and controller
const router = Router();
const alertController = new AlertController();

/**
 * GET /api/alerts
 * 
 * Get all alerts for the authenticated user.
 * Returns alerts sorted by creation date (newest first).
 * 
 * Auth: Bearer JWT required
 * Query params (optional):
 *   - acknowledged: Filter by acknowledgment status (true/false)
 *   - severity: Filter by severity (info/warning/critical)
 *   - type: Filter by type (risk/stockout/expiration)
 * 
 * Response: AlertResponse with array of Alert objects
 */
router.get('/api/alerts', async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters for filtering
    const { acknowledged, severity, type } = req.query;
    
    // Build filter object if provided
    const filters: any = {};
    
    if (acknowledged !== undefined) {
      filters.acknowledged = acknowledged === 'true';
    }
    if (severity) {
      filters.severity = severity as string;
    }
    if (type) {
      filters.type = type as string;
    }
    
    // Get alerts from controller
    const alerts = await alertController.getAlerts(req, res, filters);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to fetch alerts',
    });
  }
});

/**
 * GET /api/alerts/stats
 * 
 * Get alert statistics (counts by severity).
 * 
 * Auth: Bearer JWT required
 * 
 * Response: Object with count statistics
 */
router.get('/api/alerts/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await alertController.getAlertStats(req, res);
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to fetch alert statistics',
    });
  }
});

/**
 * POST /api/alerts/:id/acknowledge
 * 
 * Acknowledge a specific alert by ID.
 * 
 * Auth: Bearer JWT required
 * Param: Alert ID
 * 
 * Response: { success: boolean, acknowledgedAt: string }
 */
router.post('/api/alerts/:id/acknowledge', async (req: Request, res: Response): Promise<void> => {
  try {
    const alertId = parseInt(req.params.id, 10);
    
    // Validate alert ID
    if (isNaN(alertId)) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid alert ID',
      });
      return;
    }
    
    // Acknowledge the alert
    const result = await alertController.acknowledgeAlert(req, res, alertId);
    
    if (result) {
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to acknowledge alert',
    });
  }
});

export default router;
