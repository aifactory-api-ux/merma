/**
 * Merma Project - Alert Controller
 * 
 * Handles HTTP requests for alert endpoints.
 * Coordinates with alertService for business logic.
 * 
 * Version: 1.0.0
 */

import { Request, Response } from 'express';
import { AlertService } from '../services/alertService.js';
import { Alert, AlertResponse, AlertFilter, AlertStats } from '../shared/models.js.js';

/**
 * Alert Controller
 * Handles HTTP requests for alert service
 */
export class AlertController {
  private alertService: AlertService;

  constructor() {
    this.alertService = new AlertService();
  }

  /**
   * GET /api/alerts
   * 
   * Get all alerts with optional filtering.
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param filters - Optional filter parameters
   */
  async getAlerts(req: Request, res: Response, filters?: AlertFilter): Promise<void> {
    try {
      // Check authentication
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Get alerts from service
      const alerts = await this.alertService.getAlerts(filters);

      // Return response
      const response: AlertResponse = {
        alerts: alerts,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in getAlerts:', error);
      throw error;
    }
  }

  /**
   * GET /api/alerts/stats
   * 
   * Get alert statistics.
   * 
   * @param req - Express request object
   * @param res - Express response object
   */
  async getAlertStats(req: Request, res: Response): Promise<void> {
    try {
      // Check authentication
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Get statistics from service
      const stats = await this.alertService.getStats();

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error in getAlertStats:', error);
      throw error;
    }
  }

  /**
   * POST /api/alerts/:id/acknowledge
   * 
   * Acknowledge a specific alert.
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param alertId - ID of the alert to acknowledge
   */
  async acknowledgeAlert(req: Request, res: Response, alertId: number): Promise<{ success: boolean; acknowledgedAt: string } | void> {
    try {
      // Check authentication
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Validate alert ID
      if (!alertId || alertId <= 0) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid alert ID',
        });
        return;
      }

      // Acknowledge the alert
      const success = await this.alertService.acknowledgeAlert(alertId);

      if (success) {
        return {
          success: true,
          acknowledgedAt: new Date().toISOString(),
        };
      } else {
        res.status(404).json({
          error: 'NotFound',
          message: 'Alert not found',
        });
      }
    } catch (error) {
      console.error('Error in acknowledgeAlert:', error);
      throw error;
    }
  }
}

export default AlertController;
