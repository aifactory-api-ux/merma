/**
 * Provides ioredis connection and caching helpers in shared/redis.ts
 */
import Redis from 'ioredis';

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
    const password = process.env.REDIS_PASSWORD || undefined;
    redisClient = new Redis({
      host,
      port,
      password,
      // Optionally add more config here
    });
  }
  return redisClient;
}

function generateCacheKey(...args: string[]): string {
  return args.join(':');
}

async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  const value = await client.get(key);
  if (value === null) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function setCache(key: string, value: any, ttl: number): Promise<void> {
  const client = getRedisClient();
  const stringValue = JSON.stringify(value);
  if (ttl > 0) {
    await client.set(key, stringValue, 'EX', ttl);
  } else {
    await client.set(key, stringValue);
  }
}

export { getRedisClient, getCache, setCache, generateCacheKey };
