/**
 * Merma Project - Prediction Service Shared Redis
 * 
 * Shared Redis utilities for the prediction service.
 * Provides caching capabilities for prediction data.
 * 
 * Version: 1.0.0
 */

import { getRedisClient as getClient, getCache, setCache, generateCacheKey } from '../../shared/redis.js.ts';

export { getClient, getCache, setCache, generateCacheKey };

/**
 * Cache TTL constants for prediction service
 */
export const CACHE_TTL = {
  PREDICTIONS: 300,        // 5 minutes
  DEMAND_DATA: 600,       // 10 minutes
  ANALYTICS: 1800,        // 30 minutes
};

/**
 * Cache keys for prediction service
 */
export const CACHE_KEYS = {
  predictions: (date?: string) => generateCacheKey('predictions', 'demand', date || 'latest'),
  demandHistory: (itemId: number) => generateCacheKey('demand', 'history', String(itemId)),
  analytics: (type: string) => generateCacheKey('analytics', type),
};

export default {
  getClient,
  getCache,
  setCache,
  generateCacheKey,
  CACHE_TTL,
  CACHE_KEYS,
};

