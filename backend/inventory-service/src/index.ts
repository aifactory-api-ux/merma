/**
 * Merma Project - Inventory Service Entry Point
 * 
 * Inventory management microservice providing CRUD operations and overview.
 * Port: 8002
 * 
 * Version: 1.0.0
 */

import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { inventoryRouter } from './routes/inventory.js';
import { healthRouter } from './routes/health.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

// Load environment variables
dotenv.config();

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

const REQUIRED_ENV_VARS = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
];

function validateEnvironment(): void {
  const missing: string[] = [];
  
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

validateEnvironment();

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================

const app: Application = express();
const PORT = parseInt(process.env.PORT || '8002', 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'inventory-service',
    version: '1.0.0',
  });
});

// =============================================================================
// API ROUTES
// =============================================================================


// Apply authentication middleware to all /api routes
app.use('/api', authMiddleware, inventoryRouter);

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
  });
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
  console.log(`Inventory service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API: http://localhost:${PORT}/api/inventory`);
});

export default app;
