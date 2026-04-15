/**
 * Shared models and enums matching SPEC.md §2
 */

// User roles
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: number;
  email: string;
  role: UserRole;
}

// Inventory
export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  expirationDate: string | null;
  location: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export class InventoryItemEntity {
  id!: number;
  name!: string;
  quantity!: number;
  unit!: string;
  expirationDate!: string | null;
  location!: string;
  category!: string;
  createdAt!: string;
  updatedAt!: string;
}

// Alerts
export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  EXPIRING_SOON = 'EXPIRING_SOON',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export interface Alert {
  id: number;
  itemId: number;
  type: AlertType;
  status: AlertStatus;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
}

// Demand Prediction
export interface DemandPrediction {
  id: number;
  itemId: number;
  predictedDemand: number;
  predictionDate: string;
  generatedAt: string;
}

export interface DemandPredictionResponse {
  predictions: DemandPrediction[];
  generatedAt: string;
}

// Recommendations
export enum RecommendationAction {
  ORDER_MORE = 'ORDER_MORE',
  REDUCE_STOCK = 'REDUCE_STOCK',
  PROMOTE_SALE = 'PROMOTE_SALE',
  MONITOR = 'MONITOR',
}

export interface Recommendation {
  id: number;
  itemId: number;
  action: RecommendationAction;
  reason: string;
  createdAt: string;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  generatedAt: string;
}
