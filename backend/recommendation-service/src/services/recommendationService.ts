/**
 * Merma Project - Recommendation Service
 * 
 * Business logic for generating inventory recommendations.
 * Analyzes inventory data to provide actionable recommendations.
 * 
 * Version: 1.0.0
 */

import {
  Recommendation,
  RecommendationAction,
  RecommendationResponse,
  InventoryItem,
} from '../../shared/models.js';
import {
  getRedisClient,
  getCache,
  setCache,
  generateCacheKey,
} from '../../shared/redis.js';
import { getRepository } from '../../shared/db.js';
import { InventoryItemEntity } from '../../shared/models.js';

// Cache TTL for recommendations (5 minutes)
const RECOMMENDATIONS_CACHE_TTL = 300;
const CACHE_KEY = 'recommendations:all';

// Days threshold for expiring soon
const EXPIRING_SOON_DAYS = 3;

// Days threshold for low stock
const LOW_STOCK_THRESHOLD = 10;

/**
 * Generate a unique ID for recommendations
 */
function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Get current timestamp in ISO8601 format
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Check if an item is expiring soon
 */
function isExpiringSoon(expirationDate: string): boolean {
  const expDate = new Date(expirationDate);
  const now = new Date();
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= EXPIRING_SOON_DAYS && diffDays >= 0;
}

/**
 * Check if an item is low stock
 */
function isLowStock(quantity: number): boolean {
  return quantity <= LOW_STOCK_THRESHOLD;
}

/**
 * Determine the appropriate recommendation action based on inventory analysis
 */
function determineAction(
  quantity: number,
  expirationDate: string
): RecommendationAction {
  const expiringSoon = isExpiringSoon(expirationDate);
  const lowStock = isLowStock(quantity);

  if (expiringSoon && lowStock) {
    return RecommendationAction.PROMOTE_SALE;
  }

  if (expiringSoon && !lowStock) {
    return RecommendationAction.REDUCE_STOCK;
  }

  if (lowStock) {
    return RecommendationAction.ORDER_MORE;
  }

  return RecommendationAction.MONITOR;
}

/**
 * Generate reason text based on inventory analysis
 */
function generateReason(
  item: InventoryItem,
  action: RecommendationAction
): string {
  switch (action) {
    case RecommendationAction.ORDER_MORE:
      return `Low stock detected: ${item.quantity} ${item.unit} remaining. Consider ordering more to avoid stockout.`;
    case RecommendationAction.REDUCE_STOCK:
      return `Item expires on ${item.expirationDate}. Consider reducing stock through discount or use.`;
    case RecommendationAction.PROMOTE_SALE:
      return `Critical: Low stock AND expiring soon. Recommend immediate promotional sale to prevent waste.`;
    case RecommendationAction.MONITOR:
      return `Stock levels are adequate. Continue monitoring for changes.`;
    default:
      return 'Monitor inventory levels.';
  }
}

export class RecommendationService {
  /**
   * Retrieve all active recommendations
   * 
   * Returns a list of recommendations based on inventory analysis.
   * Uses caching to improve performance.
   * 
   * @returns Promise<Recommendation[]> Array of active recommendations
   */
  async getAllRecommendations(): Promise<Recommendation[]> {
    try {
      // Try to get from cache first
      const cached = await getCache<Recommendation[]>(CACHE_KEY);
      if (cached && cached.length > 0) {
        console.log('Returning cached recommendations');
        return cached;
      }
    } catch (cacheError) {
      console.warn('Cache read failed, fetching from source:', cacheError);
    }

    // Generate fresh recommendations
    const recommendations = await this.generateRecommendations();

    // Cache the results
    try {
      await setCache(CACHE_KEY, recommendations, RECOMMENDATIONS_CACHE_TTL);
    } catch (cacheError) {
      console.warn('Cache write failed:', cacheError);
    }

    return recommendations;
  }

  /**
   * Generate recommendations based on inventory analysis
   * 
   * This method analyzes inventory items and generates appropriate
   * recommendations for each item based on stock levels and expiration dates.
   * 
   * @returns Promise<Recommendation[]> Array of generated recommendations
   * @throws Error when database query fails
   */
  async generateRecommendations(): Promise<Recommendation[]> {
    try {
      // Get inventory items from the database
      const inventoryRepository = getRepository(InventoryItemEntity);
      const inventoryItems = await inventoryRepository.find();

      // Handle case when there are no inventory items
      if (!inventoryItems || inventoryItems.length === 0) {
        return [];
      }

      // Generate recommendations for each inventory item
      const recommendations: Recommendation[] = [];

      for (const item of inventoryItems) {
        const action = determineAction(item.quantity, item.expirationDate);
        const reason = generateReason(
          {
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            expirationDate: item.expirationDate,
            location: item.location,
            lastUpdated: item.lastUpdated,
          },
          action
        );

        const recommendation: Recommendation = {
          id: generateId(),
          itemId: item.id,
          itemName: item.name,
          action,
          reason,
          createdAt: getCurrentTimestamp(),
        };

        recommendations.push(recommendation);
      }

      return recommendations;
    } catch (error) {
      // Throw error if database query fails
      console.error('Failed to generate recommendations:', error);
      throw new Error('Database query failed while generating recommendations');
    }
  }

  /**
   * Clear the recommendations cache
   * 
   * Useful when inventory changes and cached recommendations become stale.
   * 
   * @returns Promise<void>
   */
  async clearCache(): Promise<void> {
    try {
      const client = getRedisClient();
      const key = generateCacheKey(CACHE_KEY);
      await client.del(key);
      console.log('Recommendations cache cleared');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get recommendations for a specific item
   * 
   * @param itemId - The ID of the inventory item
   * @returns Promise<Recommendation | null> Recommendation for the item or null if not found
   */
  async getRecommendationForItem(itemId: number): Promise<Recommendation | null> {
    const allRecommendations = await this.getAllRecommendations();
    return allRecommendations.find((r) => r.itemId === itemId) || null;
  }
}

export default RecommendationService;
