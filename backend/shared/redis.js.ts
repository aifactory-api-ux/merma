/**
 * Merma Project - Shared Redis Module (JS Format)
 * 
 * Common Redis utilities for all backend services.
 * Provides caching capabilities for prediction data, sessions, and more.
 * 
 * Version: 1.0.0
 */

import Redis from 'ioredis';

// Redis client instance
let redisClient = null;

/**
 * Get or create the Redis client connection
 * Uses environment variables for connection configuration
 * 
 * @returns Redis client instance
 */
export function getRedisClient() {
  if (!redisClient) {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD;
    
    const options = {
      host,
      port,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableReadyCheck: true,
      lazyConnect: false,
    };
    
    if (password) {
      options.password = password;
    }
    
    redisClient = new Redis(options);
    
    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis client error:', err.message);
    });
    
    redisClient.on('ready', () => {
      console.log('Redis client ready');
    });
  }
  
  return redisClient;
}

/**
 * Get a value from Redis cache
 * 
 * @template T - Type of cached value
 * @param key - Cache key
 * @returns Cached value or null if not found
 */
export async function getCache(key) {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    
    if (value === null) {
      return null;
    }
    
    return JSON.parse(value);
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
}

/**
 * Set a value in Redis cache with TTL
 * 
 * @param key - Cache key
 * @param value - Value to cache (will be JSON stringified)
 * @param ttl - Time to live in seconds
 */
export async function setCache(key, value, ttl = 300) {
  try {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    await client.setex(key, ttl, serialized);
  } catch (error) {
    console.error('Redis setCache error:', error);
  }
}

/**
 * Delete a key from Redis cache
 * 
 * @param key - Cache key to delete
 * @returns True if key was deleted
 */
export async function deleteCache(key) {
  try {
    const client = getRedisClient();
    const result = await client.del(key);
    return result > 0;
  } catch (error) {
    console.error('Redis deleteCache error:', error);
    return false;
  }
}

/**
 * Check if Redis is connected and healthy
 * 
 * @returns True if Redis is healthy
 */
export async function checkHealth() {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

/**
 * Generate a cache key from multiple parts
 * Joins arguments with colon separator
 * 
 * @param args - Key parts to join
 * @returns Generated cache key
 */
export function generateCacheKey(...args) {
  return args.filter(Boolean).join(':');
}

/**
 * Close the Redis connection
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed');
  }
}

/**
 * Increment a counter in Redis
 * 
 * @param key - Counter key
 * @returns New counter value
 */
export async function incrementCounter(key) {
  try {
    const client = getRedisClient();
    return await client.incr(key);
  } catch (error) {
    console.error('Redis incrementCounter error:', error);
    return 0;
  }
}

/**
 * Get TTL for a specific key
 * 
 * @param key - Cache key
 * @returns TTL in seconds, or -1 if key doesn't exist
 */
export async function getTTL(key) {
  try {
    const client = getRedisClient();
    return await client.ttl(key);
  } catch (error) {
    console.error('Redis getTTL error:', error);
    return -1;
  }
}

/**
 * Cache TTL constants
 */
export const CACHE_TTL = {
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 1800,         // 30 minutes
  VERY_LONG: 3600,    // 1 hour
  DAY: 86400,         // 24 hours
};

export default {
  getRedisClient,
  getCache,
  setCache,
  deleteCache,
  checkHealth,
  generateCacheKey,
  closeRedis,
  incrementCounter,
  getTTL,
  CACHE_TTL,
};
