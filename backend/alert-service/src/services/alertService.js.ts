/**
 * Merma Project - Alert Service Business Logic
 * 
 * Complete implementation of alert operations including:
 * - Create, read, update, delete alerts
 * - Alert acknowledgment
 * - Filtering and statistics
 * 
 * Version: 1.0.0
 */

import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Alert types in the system
 */
export enum AlertType {
  RISK = 'risk',
  STOCKOUT = 'stockout',
  EXPIRATION = 'expiration',
}

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

/**
 * Alert interface
 */
export interface Alert {
  id: number;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  relatedItemId: number | null;
  createdAt: string;
  acknowledged: boolean;
}

/**
 * Alert response interface
 */
export interface AlertResponse {
  alerts: Alert[];
}

/**
 * Alert creation request interface
 */
export interface CreateAlertRequest {
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  relatedItemId?: number;
}

/**
 * Alert update request interface
 */
export interface UpdateAlertRequest {
  acknowledged?: boolean;
}

/**
 * Alert filter options
 */
export interface AlertFilter {
  acknowledged?: boolean;
  severity?: AlertSeverity;
  type?: AlertType;
}

/**
 * Alert statistics interface
 */
export interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  unacknowledged: number;
}

/**
 * Database connection pool
 */
let pool: Pool | null = null;

/**
 * Get or create the database connection pool
 * Uses environment variables for connection configuration
 */
function getPool(): Pool {
  if (!pool) {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'merma',
      max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
    };

    pool = new Pool(config);
    
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });

    console.log('Database connection pool initialized for alert service');
  }

  return pool;
}

/**
 * Get a client from the pool for transaction support
 */
export async function getClient(): Promise<PoolClient> {
  const p = getPool();
  return await p.connect();
}

/**
 * Execute a query with automatic pool management
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getPool();
  const result = await p.query(text, params);
  return result.rows as T[];
}

/**
 * Execute a single query and return the first result
 */
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute a mutation (INSERT, UPDATE, DELETE)
 */
export async function execute(text: string, params?: any[]): Promise<number> {
  const p = getPool();
  const result = await p.query(text, params);
  return result.rowCount || 0;
}

/**
 * Validation error class for alert operations
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Input data for creating a new alert
 */
export interface CreateAlertInput {
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  relatedItemId?: number | null;
}

/**
 * Fetch all alerts from the database
 * 
 * @param filters - Optional filters for alert query
 * @returns Promise<Alert[]> - Array of alert objects
 */
export async function findAll(filters?: AlertFilter): Promise<Alert[]> {
  let sql = 'SELECT id, type, message, severity, related_item_id, created_at, acknowledged FROM alerts WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (filters) {
    if (filters.acknowledged !== undefined) {
      sql += ` AND acknowledged = $${paramIndex++}`;
      params.push(filters.acknowledged);
    }
    if (filters.severity) {
      sql += ` AND severity = $${paramIndex++}`;
      params.push(filters.severity);
    }
    if (filters.type) {
      sql += ` AND type = $${paramIndex++}`;
      params.push(filters.type);
    }
  }

  sql += ' ORDER BY created_at DESC';

  const rows = await query<{
    id: number;
    type: string;
    message: string;
    severity: string;
    related_item_id: number | null;
    created_at: string;
    acknowledged: boolean;
  }>(sql, params);

  return rows.map(row => ({
    id: row.id,
    type: row.type as AlertType,
    message: row.message,
    severity: row.severity as AlertSeverity,
    relatedItemId: row.related_item_id,
    createdAt: row.created_at,
    acknowledged: row.acknowledged,
  }));
}

/**
 * Fetch all alerts (alias for findAll)
 */
export async function getAlerts(filters?: AlertFilter): Promise<Alert[]> {
  return findAll(filters);
}

/**
 * Find an alert by its ID
 * 
 * @param id - The alert ID to search for
 * @returns Promise<Alert | null> - Alert object if found, null otherwise
 */
export async function findById(id: number): Promise<Alert | null> {
  const row = await queryOne<{
    id: number;
    type: string;
    message: string;
    severity: string;
    related_item_id: number | null;
    created_at: string;
    acknowledged: boolean;
  }>('SELECT id, type, message, severity, related_item_id, created_at, acknowledged FROM alerts WHERE id = $1', [id]);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    type: row.type as AlertType,
    message: row.message,
    severity: row.severity as AlertSeverity,
    relatedItemId: row.related_item_id,
    createdAt: row.created_at,
    acknowledged: row.acknowledged,
  };
}

/**
 * Create a new alert
 * 
 * @param input - Alert data to create
 * @returns Promise<Alert> - Created alert object
 * @throws ValidationError if required fields are missing
 */
export async function create(input: CreateAlertInput): Promise<Alert> {
  // Validate required fields
  if (!input.type) {
    throw new ValidationError('Alert type is required');
  }
  
  if (!input.message) {
    throw new ValidationError('Alert message is required');
  }
  
  if (!input.severity) {
    throw new ValidationError('Alert severity is required');
  }
  
  // Validate enum values
  const validTypes = Object.values(AlertType);
  if (!validTypes.includes(input.type)) {
    throw new ValidationError(`Invalid alert type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  const validSeverities = Object.values(AlertSeverity);
  if (!validSeverities.includes(input.severity)) {
    throw new ValidationError(`Invalid alert severity. Must be one of: ${validSeverities.join(', ')}`);
  }
  
  const row = await queryOne<{
    id: number;
    type: string;
    message: string;
    severity: string;
    related_item_id: number | null;
    created_at: string;
    acknowledged: boolean;
  }>(
    `INSERT INTO alerts (type, message, severity, related_item_id, created_at, acknowledged)
     VALUES ($1, $2, $3, $4, NOW(), false)
     RETURNING id, type, message, severity, related_item_id, created_at, acknowledged`,
    [input.type, input.message, input.severity, input.relatedItemId || null]
  );

  if (!row) {
    throw new Error('Failed to create alert');
  }

  return {
    id: row.id,
    type: row.type as AlertType,
    message: row.message,
    severity: row.severity as AlertSeverity,
    relatedItemId: row.related_item_id,
    createdAt: row.created_at,
    acknowledged: row.acknowledged,
  };
}

/**
 * Delete an alert by its ID
 * 
 * @param id - The alert ID to delete
 * @returns Promise<boolean> - true if deleted successfully, false if not found
 */
export async function remove(id: number): Promise<boolean> {
  const count = await execute('DELETE FROM alerts WHERE id = $1', [id]);
  return count > 0;
}

/**
 * Acknowledge an alert by setting acknowledged to true
 * 
 * @param alertId - The ID of the alert to acknowledge
 * @returns Promise<boolean> - true if successful, false if not found
 */
export async function acknowledgeAlert(alertId: number): Promise<boolean> {
  const count = await execute(
    'UPDATE alerts SET acknowledged = true, acknowledged_at = NOW() WHERE id = $1',
    [alertId]
  );
  return count > 0;
}

/**
 * Get alert statistics
 * 
 * @returns Promise<AlertStats> - Statistics about alerts
 */
export async function getStats(): Promise<AlertStats> {
  const totalRow = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM alerts');
  const total = parseInt(totalRow?.count || '0', 10);

  const criticalRow = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM alerts WHERE severity = 'critical' AND acknowledged = false"
  );
  const critical = parseInt(criticalRow?.count || '0', 10);

  const warningRow = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM alerts WHERE severity = 'warning' AND acknowledged = false"
  );
  const warning = parseInt(warningRow?.count || '0', 10);

  const infoRow = await queryOne<{ count: string }>(
    "SELECT COUNT(*) as count FROM alerts WHERE severity = 'info' AND acknowledged = false"
  );
  const info = parseInt(infoRow?.count || '0', 10);

  const unacknowledgedRow = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM alerts WHERE acknowledged = false'
  );
  const unacknowledged = parseInt(unacknowledgedRow?.count || '0', 10);

  return {
    total,
    critical,
    warning,
    info,
    unacknowledged,
  };
}

/**
 * Health check for database connection
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const result = await queryOne<{ health: number }>('SELECT 1 as health');
    return result !== null;
  } catch (error) {
    console.error('Alert service database health check failed:', error);
    return false;
  }
}

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Alert service database connection pool closed');
  }
}

export default {
  AlertType,
  AlertSeverity,
  Alert,
  AlertResponse,
  CreateAlertRequest,
  UpdateAlertRequest,
  AlertFilter,
  AlertStats,
  findAll,
  getAlerts,
  findById,
  create,
  remove,
  acknowledgeAlert,
  getStats,
  checkHealth,
  closePool,
};
