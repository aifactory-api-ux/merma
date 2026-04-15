/**
 * Merma Project - Frontend Types
 * 
 * TypeScript interfaces matching backend API contracts.
 * Exported from shared foundation for frontend use.
 * 
 * Version: 1.0.0
 */

// Re-export all types from backend models for frontend use
export type { UserSummary, AuthResponse, InventoryItem, InventoryOverview, DemandPrediction, DemandPredictionResponse, Recommendation, RecommendationResponse, Alert, AlertResponse };

// Additional frontend-specific types
export interface ApiError {
  message: string;
  status?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
