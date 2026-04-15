/**
 * Merma Project - Inventory Service Health Routes
 * 
 * Health check endpoint for the inventory service.
 * 
 * Version: 1.0.0
 */

import { Router, Request, Response } from 'express';

const router = Router();

const SERVICE_VERSION = process.env.SERVICE_VERSION || '1.0.0';
const SERVICE_NAME = 'inventory-service';

/**
 * GET /health
 * 
 * Health check endpoint that returns service status.
 * No authentication required.
 * 
 * Response: { status: string, service: string, version: string }
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/ready
 * 
 * Readiness probe - checks if service can handle requests.
 * Verifies database and Redis connectivity.
 * 
 * Response: { status: string, checks: object }
 */
router.get('/ready', async (_req: Request, res: Response): Promise<void> => {
  try {
    const checks = {
      database: true,
      redis: true,
    };

    // Check database connection
    try {
      const db = require('../../../shared/db.js');
      await db.queryOne('SELECT 1');
    } catch (error) {
      checks.database = false;
    }

    // Check Redis connection
    try {
      const redis = require('../../../shared/redis.js');
      await redis.checkHealth();
    } catch (error) {
      checks.redis = false;
    }

    const allReady = checks.database && checks.redis;

    res.status(allReady ? 200 : 503).json({
      status: allReady ? 'ready' : 'not_ready',
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'not_ready',
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/live
 * 
 * Liveness probe - checks if service is running.
 * Simple check that doesn't depend on external dependencies.
 * 
 * Response: { status: string }
 */
router.get('/live', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;
