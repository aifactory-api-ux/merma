/**
 * Merma Project - Recommendation Service Shared Models
 * 
 * Local copy of shared models for the recommendation service.
 * Provides type definitions for recommendations and related entities.
 * 
 * Version: 1.0.0
 */

// Minimal implementation for shared/models.js

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CHEF = 'chef',
  STAFF = 'staff',
}

/**
 * Recommendation action types
 */
export enum RecommendationAction {
  ORDER_MORE = 'order_more',
  REDUCE_STOCK = 'reduce_stock',
  PROMOTE_SALE = 'promote_sale',
  MONITOR = 'monitor',
}

/**
 * User summary interface (exposed to clients)
 */
export interface UserSummary {
  id: number;
  email: string;
  role: string;
}

/**
 * Recommendation interface
 */
export interface Recommendation {
  id: number;
  itemId: number;
  itemName?: string;
  action: string;
  reason: string;
  createdAt: string;
}

/**
 * Recommendation response interface
 */
export interface RecommendationResponse {
  recommendations: Recommendation[];
  generatedAt: string;
}

/**
 * Recommendation filter options
 */
export interface RecommendationFilter {
  itemId?: number;
  action?: RecommendationAction;
  minConfidence?: number;
}

/**
 * Recommendation creation request interface
 */
export interface CreateRecommendationRequest {
  itemId: number;
  itemName: string;
  action: RecommendationAction;
  reason: string;
}

/**
 * Recommendation update request interface
 */
export interface UpdateRecommendationRequest {
  action?: RecommendationAction;
  reason?: string;
}

// Also export InventoryItem and InventoryItemEntity for service import
export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  expirationDate: string;
}

export interface InventoryItemEntity extends InventoryItem {}

export default {
  UserRole,
  RecommendationAction,
  UserSummary,
  Recommendation,
  RecommendationResponse,
  RecommendationFilter,
  CreateRecommendationRequest,
  UpdateRecommendationRequest,
  InventoryItem,
  InventoryItemEntity,
};
