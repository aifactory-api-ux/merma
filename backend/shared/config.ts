/**
 * Merma Project - Shared Configuration
 * 
 * Centralized configuration management for all backend services.
 * Loads environment variables and provides typed configuration objects.
 * 
 * Version: 1.0.0
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Server configuration interface
 */
export interface ServerConfig {
  port: number;
  host: string;
  env: string;
}

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
}

/**
 * Redis configuration interface
 */
export interface RedisConfig {
  host: string;
  port: number;
  password: string | undefined;
  db: number;
}

/**
 * JWT configuration interface
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

/**
 * External services configuration interface
 */
export interface ExternalServicesConfig {
  predictionServiceUrl: string;
  recommendationServiceUrl: string;
  alertServiceUrl: string;
  inventoryServiceUrl: string;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  externalServices: ExternalServicesConfig;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  server: {
    port: parseInt(process.env.PORT || '8000', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'merma',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  externalServices: {
    predictionServiceUrl: process.env.PREDICTION_SERVICE_URL || 'http://localhost:8003',
    recommendationServiceUrl: process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:8004',
    alertServiceUrl: process.env.ALERT_SERVICE_URL || 'http://localhost:8005',
    inventoryServiceUrl: process.env.INVENTORY_SERVICE_URL || 'http://localhost:8002',
  },
};

/**
 * Required environment variables for each service
 */
export const REQUIRED_ENV_VARS: Record<string, string[]> = {
  authService: ['PORT', 'JWT_SECRET', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'],
  inventoryService: ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'],
  predictionService: ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'REDIS_HOST', 'REDIS_PORT'],
  recommendationService: ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'REDIS_HOST', 'REDIS_PORT'],
  alertService: ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'],
};

/**
 * Validate required environment variables
 * @param serviceName - Name of the service to validate vars for
 * @throws Error if required environment variables are missing
 */
export function validateEnvironment(serviceName: string): void {
  const required = REQUIRED_ENV_VARS[serviceName] || [];
  const missing: string[] = [];

  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(`FATAL: Missing required environment variables for ${serviceName}: ${missing.join(', ')}`);
  }
}


/**
 * Get server configuration
 */
export function getServerConfig(): ServerConfig {
  return DEFAULT_CONFIG.server;
}

/**
 * Get database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  return DEFAULT_CONFIG.database;
}

/**
 * Get Redis configuration
 */
export function getRedisConfig(): RedisConfig {
  return DEFAULT_CONFIG.redis;
}

/**
 * Get JWT configuration
 */
export function getJwtConfig(): JwtConfig {
  return DEFAULT_CONFIG.jwt;
}

/**
 * Get external services configuration
 */
export function getExternalServicesConfig(): ExternalServicesConfig {
  return DEFAULT_CONFIG.externalServices;
}

/**
 * Get complete application configuration
 */
export function getAppConfig(): AppConfig {
  return DEFAULT_CONFIG;
}

/**
 * Get environment variable with fallback
 * @param key - Environment variable name
 * @param fallback - Default value if not set
 */
export function getEnv(key: string, fallback?: string): string {
  return process.env[key] || fallback || '';
}

/**
 * Get numeric environment variable with fallback
 * @param key - Environment variable name
 * @param fallback - Default value if not set
 */
export function getEnvNumber(key: string, fallback: number): number {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return fallback;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return DEFAULT_CONFIG.server.env === 'production';
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return DEFAULT_CONFIG.server.env === 'development';
}

export default {
  validateEnvironment,
  getServerConfig,
  getDatabaseConfig,
  getRedisConfig,
  getJwtConfig,
  getExternalServicesConfig,
  getAppConfig,
  getEnv,
  getEnvNumber,
  isProduction,
  isDevelopment,
  REQUIRED_ENV_VARS,
};
