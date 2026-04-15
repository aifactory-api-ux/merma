/**
 * Merma Project - Recommendation Service Shared Database
 *
 * Database utilities for the recommendation service.
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
 * Inventory item interface for recommendations
 */
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiration_date: string;
  location: string;
  last_updated: string;
}

/**
 * Sales history interface
 */
export interface SalesHistory {
  id: number;
  item_id: number;
  quantity_sold: number;
  sale_date: string;
  price: number;
}

/**
 * Repository pattern for Inventory entity
 */
export const inventoryRepository = {
  /**
   * Find all inventory items
   */
  async findAll(): Promise<InventoryItem[]> {
    return await query<InventoryItem>(
      'SELECT * FROM inventory_items ORDER BY name'
    );
  },

  /**
   * Find low stock items
   */
  async findLowStock(threshold: number = 10): Promise<InventoryItem[]> {
    return await query<InventoryItem>(
      'SELECT * FROM inventory_items WHERE quantity <= $1 ORDER BY quantity',
      [threshold]
    );
  },

  /**
   * Find expiring soon items
   */
  async findExpiringSoon(daysAhead: number = 7): Promise<InventoryItem[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return await query<InventoryItem>(
      `SELECT * FROM inventory_items 
       WHERE expiration_date <= $1 AND expiration_date > NOW()
       ORDER BY expiration_date`,
      [futureDate.toISOString()]
    );
  },

  /**
   * Find a single inventory item by ID
   */
  async findById(id: number): Promise<InventoryItem | null> {
    return await queryOne<InventoryItem>(
      'SELECT * FROM inventory_items WHERE id = $1',
      [id]
    );
  },

  /**
   * Get inventory statistics
   */
  async getStats(): Promise<{ total: number; lowStock: number; expiring: number }> {
    const totalResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM inventory_items'
    );
    
    const lowStockResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= 10'
    );
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    const expiringResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM inventory_items WHERE expiration_date <= $1',
      [futureDate.toISOString()]
    );

    return {
      total: parseInt(totalResult?.count || '0', 10),
      lowStock: parseInt(lowStockResult?.count || '0', 10),
      expiring: parseInt(expiringResult?.count || '0', 10),
    };
  },
};

/**
 * Repository pattern for Sales History
 */
export const salesRepository = {
  /**
   * Get sales history for an item
   */
  async getByItemId(itemId: number, days: number = 30): Promise<SalesHistory[]> {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    
    return await query<SalesHistory>(
      `SELECT * FROM sales_history 
       WHERE item_id = $1 AND sale_date >= $2
       ORDER BY sale_date DESC`,
      [itemId, pastDate.toISOString()]
    );
  },

  /**
   * Get aggregated sales data for recommendations
   */
  async getAggregatedSales(itemId: number): Promise<{
    totalSold: number;
    avgDaily: number;
    lastSaleDate: string | null;
  }> {
    const result = await queryOne<{
      total_sold: string;
      avg_daily: string;
      last_sale_date: string | null;
    }>(
      `SELECT 
         COALESCE(SUM(quantity_sold), 0) as total_sold,
         COALESCE(AVG(quantity_sold), 0) as avg_daily,
         MAX(sale_date) as last_sale_date
       FROM sales_history 
       WHERE item_id = $1 AND sale_date >= NOW() - INTERVAL '30 days'`,
      [itemId]
    );

    return {
      totalSold: parseInt(result?.total_sold || '0', 10),
      avgDaily: parseFloat(result?.avg_daily || '0'),
      lastSaleDate: result?.last_sale_date || null,
    };
  },

  /**
   * Get all sales data for trend analysis
   */
  async getAllSales(days: number = 30): Promise<any[]> {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    
    return await query(
      `SELECT item_id, SUM(quantity_sold) as total_sold, AVG(quantity_sold) as avg_daily
       FROM sales_history
       WHERE sale_date >= $1
       GROUP BY item_id
       ORDER BY total_sold DESC`,
      [pastDate.toISOString()]
    );
  },
};

/**
 * Repository pattern for Recommendations
 */
export const recommendationRepository = {
  /**
   * Get all recommendations
   */
  async findAll(): Promise<any[]> {
    return await query(
      `SELECT r.*, i.name as item_name 
       FROM recommendations r
       LEFT JOIN inventory_items i ON r.item_id = i.id
       ORDER BY r.created_at DESC`
    );
  },

  /**
   * Get active recommendations
   */
  async findActive(): Promise<any[]> {
    return await query(
      `SELECT r.*, i.name as item_name 
       FROM recommendations r
       LEFT JOIN inventory_items i ON r.item_id = i.id
       WHERE r.status = 'active'
       ORDER BY r.created_at DESC`
    );
  },

  /**
   * Create a new recommendation
   */
  async create(recommendation: {
    item_id: number;
    action: string;
    reason: string;
    confidence?: number;
  }): Promise<any> {
    const result = await query(
      `INSERT INTO recommendations (item_id, action, reason, confidence, status, created_at)
       VALUES ($1, $2, $3, $4, 'active', NOW())
       RETURNING *`,
      [
        recommendation.item_id,
        recommendation.action,
        recommendation.reason,
        recommendation.confidence || 0.8
      ]
    );
    return result[0];
  },

  /**
   * Update recommendation status
   */
  async updateStatus(id: number, status: string): Promise<boolean> {
    const count = await execute(
      'UPDATE recommendations SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );
    return count > 0;
  },
};

/**
 * Get the repository for any entity
 * Provides a generic interface similar to TypeORM
 */
export function getRepository(entityName: string): any {
  switch (entityName) {
    case 'Inventory':
    case 'inventory':
      return inventoryRepository;
    case 'Sales':
    case 'sales':
      return salesRepository;
    case 'Recommendation':
    case 'recommendation':
      return recommendationRepository;
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
  inventoryRepository,
  salesRepository,
  recommendationRepository,
  checkHealth,
  closePool,
};
