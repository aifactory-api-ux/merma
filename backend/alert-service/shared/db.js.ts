/**
 * Merma Project - Alert Service Shared Database
 * 
 * Database utilities for the alert service.
 * Provides repository-like access patterns and connection management.
 * 
 * Version: 1.0.0
 */

import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection pool
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

    console.log('Database connection pool initialized');
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
 * 
 * @param text - SQL query text
 * @param params - Query parameters
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getPool();
  const result = await p.query(text, params);
  return result.rows as T[];
}

/**
 * Execute a single query and return the first result
 * 
 * @param text - SQL query text
 * @param params - Query parameters
 */
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute a mutation (INSERT, UPDATE, DELETE)
 * 
 * @param text - SQL query text
 * @param params - Query parameters
 */
export async function execute(text: string, params?: any[]): Promise<number> {
  const p = getPool();
  const result = await p.query(text, params);
  return result.rowCount || 0;
}

/**
 * Repository pattern for Alert entity
 */
export const alertRepository = {
  /**
   * Find all alerts, optionally filtered
   */
  async find(filters?: { acknowledged?: boolean; severity?: string; type?: string }): Promise<any[]> {
    let sql = 'SELECT * FROM alerts WHERE 1=1';
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
    return await query(sql, params);
  },

  /**
   * Find a single alert by ID
   */
  async findById(id: number): Promise<any | null> {
    return await queryOne('SELECT * FROM alerts WHERE id = $1', [id]);
  },

  /**
   * Create a new alert
   */
  async create(alert: {
    type: string;
    message: string;
    severity: string;
    related_item_id?: number;
  }): Promise<any> {
    const result = await query(
      `INSERT INTO alerts (type, message, severity, related_item_id, created_at, acknowledged)
       VALUES ($1, $2, $3, $4, NOW(), false)
       RETURNING *`,
      [alert.type, alert.message, alert.severity, alert.related_item_id || null]
    );
    return result[0];
  },

  /**
   * Update alert acknowledgment status
   */
  async acknowledge(id: number): Promise<boolean> {
    const count = await execute(
      'UPDATE alerts SET acknowledged = true, acknowledged_at = NOW() WHERE id = $1',
      [id]
    );
    return count > 0;
  },

  /**
   * Delete an alert
   */
  async delete(id: number): Promise<boolean> {
    const count = await execute('DELETE FROM alerts WHERE id = $1', [id]);
    return count > 0;
  },

  /**
   * Get unacknowledged alerts count by severity
   */
  async getCountsBySeverity(): Promise<Record<string, number>> {
    const rows = await query(
      `SELECT severity, COUNT(*) as count FROM alerts 
       WHERE acknowledged = false 
       GROUP BY severity`
    );
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.severity] = parseInt(row.count, 10);
    }
    return counts;
  },
};

/**
 * Get the repository for any entity
 * Provides a generic interface similar to TypeORM
 */
export function getRepository(entityName: string): any {
  // Return appropriate repository based on entity name
  switch (entityName) {
    case 'Alert':
    case 'alert':
      return alertRepository;
    default:
      console.warn(`Repository for entity '${entityName}' not found, returning mock`);
      return {
        find: async () => [],
        findOne: async () => null,
        save: async (data: any) => data,
      };
  }
}

/**
 * Health check for database connection
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const result = await queryOne('SELECT 1 as health');
    return result !== null;
  } catch (error) {
    console.error('Database health check failed:', error);
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
    console.log('Database connection pool closed');
  }
}

export default {
  getPool,
  getClient,
  query,
  queryOne,
  execute,
  getRepository,
  alertRepository,
  checkHealth,
  closePool,
};
