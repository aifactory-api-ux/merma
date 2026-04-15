/**
 * Merma Project - Auth Service Health Routes
 * 
 * Health check endpoint for the auth service.
 * 
 * Version: 1.0.0
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * 
 * Health check endpoint that returns service status.
 * No authentication required.
 * 
 * Response: { status: string, service: string, version: string }
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
