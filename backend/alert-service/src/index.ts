/**
 * Alert Service - Main Entry Point
 *
 * Merma Project - System of Optimization for Perishable Product Waste
 * Alert Service handles inventory alerts and notifications
 *
 * Version: 1.0.0
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { getDatabaseConfig, validateDatabaseConfig, getDataSource, getDataSourceOptions } from '../shared/db.js';
import { AlertEntity } from '../shared/models.js';
import alertsRouter from './routes/alerts.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

// Load environment variables
dotenv.config();

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE'
];

function validateEnvironment(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Validate database config
  const dbConfig = getDatabaseConfig();
  const validation = validateDatabaseConfig(dbConfig);

  if (validation) {
    console.error(`Database configuration error: ${validation.error}`);
    console.error(`Missing fields: ${validation.missing_fields?.join(', ')}`);
    process.exit(1);
  }
}

// =============================================================================
// EXPRESS APPLICATION SETUP
// =============================================================================

const app: Application = express();
const PORT = process.env.PORT || 8005;
const SERVICE_NAME = 'alert-service';
const SERVICE_VERSION = '1.0.0';

// Middleware
app.use(cors());
app.use(express.json());

// =============================================================================
// ERROR HANDLING
// =============================================================================

interface AppError extends Error {
  statusCode?: number;
}

function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Catch unhandled rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
});

// Catch uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// =============================================================================
// HEALTH CHECK
// =============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: SERVICE_NAME,
    version: SERVICE_VERSION
  });
});

// =============================================================================
// API ROUTES
// =============================================================================


// Apply authentication middleware to all /api routes
app.use('/api', authMiddleware);

// Alert routes
app.use('/api/alerts', alertsRouter);

// =============================================================================
// DATABASE INITIALIZATION
// =============================================================================

async function initializeDatabase(): Promise<void> {
  try {
    const dbConfig = getDatabaseConfig();
    const dataSourceOptions = getDataSourceOptions(dbConfig);

    const dataSource = new (await import('typeorm')).DataSource(dataSourceOptions);
    await dataSource.initialize();

    console.log('Database connection established');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// =============================================================================
// SERVER STARTUP
// =============================================================================

async function startServer(): Promise<void> {
  validateEnvironment();
  await initializeDatabase();

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`${SERVICE_NAME} running on port ${PORT}`);
    console.log(`Version: ${SERVICE_VERSION}`);
    console.log(`Health check available at /health`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
