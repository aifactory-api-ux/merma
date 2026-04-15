export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CHEF = 'chef',
  STAFF = 'staff',
}

export enum RecommendationAction {
  ORDER_MORE = 'order_more',
  REDUCE_STOCK = 'reduce_stock',
  PROMOTE_SALE = 'promote_sale',
  MONITOR = 'monitor',
}

export enum AlertType {
  RISK = 'risk',
  STOCKOUT = 'stockout',
  EXPIRATION = 'expiration',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export interface UserSummary {
  id: number;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  location: string;
  lastUpdated: string;
}

export interface InventoryOverview {
  totalItems: number;
  lowStockItems: InventoryItem[];
  expiringSoonItems: InventoryItem[];
  totalValue: number;
  currency: string;
}

export interface DemandPrediction {
  itemId: number;
  itemName: string;
  predictedDemand: number;
  predictionDate: string;
  confidence: number;
}

export interface DemandPredictionResponse {
  predictions: DemandPrediction[];
  generatedAt: string;
}

export interface Recommendation {
  id: number;
  itemId: number;
  itemName: string;
  action: RecommendationAction;
  reason: string;
  createdAt: string;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  generatedAt: string;
}

export interface Alert {
  id: number;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  relatedItemId: number | null;
  createdAt: string;
  acknowledged: boolean;
}

export interface AlertResponse {
  alerts: Alert[];
}
