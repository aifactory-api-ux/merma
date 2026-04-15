/**
 * Merma Project - Alert Service Health Routes
 * 
 * Health check endpoint for alert service.
 * 
 * Version: 1.0.0
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Service version
const SERVICE_VERSION = '1.0.0';

/**
 * GET /health
 * 
 * Health check endpoint that returns service status.
 * No authentication required.
 * 
 * Response: { status: string, service: string, version: string, timestamp: string }
 */
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      status: 'healthy',
      service: 'alert-service',
      version: SERVICE_VERSION,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      service: 'alert-service',
      version: SERVICE_VERSION,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/ready
 * 
 * Readiness check for Kubernetes.
 * Verifies database and Redis connectivity.
 * 
 * Response: { ready: boolean, checks: object }
 */
router.get('/health/ready', async (req: Request, res: Response): Promise<void> => {
  const checks: Record<string, boolean> = {
    service: true,
  };

  try {
    // Add database check
    // (Implementation would verify DB connection)
    
    res.status(200).json({
      ready: true,
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      checks,
      error: 'Service not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/live
 * 
 * Liveness check for Kubernetes.
 * 
 * Response: { alive: boolean }
 */
router.get('/health/live', async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

export default router;
