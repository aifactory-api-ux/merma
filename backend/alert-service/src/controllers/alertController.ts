/**
 * Alert Service - Controller
 * 
 * Handles incoming HTTP requests for alert operations
 * 
 * Version: 1.0.0
 */

import { Request, Response } from 'express';
import { getAlerts as getAlertsService, acknowledgeAlert as acknowledgeAlertService, createAlert as createAlertService, getAlertById as getAlertByIdService, deleteAlert as deleteAlertService } from '../services/alertService.js';
import { AlertResponse, Alert, AlertType, AlertSeverity } from '../../shared/models.js';

/**
 * GET /api/alerts
 * 
 * Retrieve all alerts
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function getAlerts(req: Request, res: Response): Promise<void> {
  try {
    const alerts = await getAlertsService();
    
    const response: AlertResponse = {
      alerts: alerts
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}

/**
 * POST /api/alerts
 * 
 * Create a new alert
 * 
 * @param req - Express request object with alert data in body
 * @param res - Express response object
 */
export async function createAlert(req: Request, res: Response): Promise<void> {
  try {
    const { type, message, severity, relatedItemId } = req.body;
    
    // Validate required fields
    if (!type) {
      res.status(400).json({ error: 'Missing required field: type' });
      return;
    }
    
    if (!message) {
      res.status(400).json({ error: 'Missing required field: message' });
      return;
    }
    
    // Validate type enum
    const validTypes = ['risk', 'stockout', 'expiration'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ error: 'Invalid type. Must be one of: risk, stockout, expiration' });
      return;
    }
    
    // Validate severity if provided
    if (severity) {
      const validSeverities = ['info', 'warning', 'critical'];
      if (!validSeverities.includes(severity)) {
        res.status(400).json({ error: 'Invalid severity. Must be one of: info, warning, critical' });
        return;
      }
    }
    
    const alert = await createAlertService({
      type: type as AlertType,
      message,
      severity: (severity as AlertSeverity) || AlertSeverity.INFO,
      relatedItemId: relatedItemId || null
    });
    
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
}

/**
 * GET /api/alerts/:id
 * 
 * Retrieve a single alert by ID
 * 
 * @param req - Express request object with alert ID in params
 * @param res - Express response object
 */
export async function getAlertById(req: Request, res: Response): Promise<void> {
  try {
    const alertId = parseInt(req.params.id, 10);
    
    if (isNaN(alertId)) {
      res.status(400).json({ error: 'Invalid alert ID' });
      return;
    }
    
    const alert = await getAlertByIdService(alertId);
    
    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    
    res.status(200).json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
}

/**
 * DELETE /api/alerts/:id
 * 
 * Delete an alert by ID
 * 
 * @param req - Express request object with alert ID in params
 * @param res - Express response object
 */
export async function deleteAlert(req: Request, res: Response): Promise<void> {
  try {
    const alertId = parseInt(req.params.id, 10);
    
    if (isNaN(alertId)) {
      res.status(400).json({ error: 'Invalid alert ID' });
      return;
    }
    
    const deleted = await deleteAlertService(alertId);
    
    if (!deleted) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
}

/**
 * POST /api/alerts/:id/acknowledge
 * 
 * Acknowledge an alert by ID
 * 
 * @param req - Express request object with alert ID in params
 * @param res - Express response object
 */
export async function acknowledgeAlert(req: Request, res: Response): Promise<void> {
  try {
    const alertId = parseInt(req.params.id, 10);
    
    if (isNaN(alertId)) {
      res.status(400).json({ error: 'Invalid alert ID' });
      return;
    }
    
    const success = await acknowledgeAlertService(alertId);
    
    if (!success) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
}
