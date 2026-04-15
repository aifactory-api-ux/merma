/**
 * Merma Project - Prediction Controller
 * 
 * Handles demand prediction endpoint requests.
 * Generates demand predictions for inventory items.
 * 
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import {
  DemandPrediction,
  DemandPredictionResponse,
  InventoryItem,
  UserRole,
} from '../../shared/models.js.ts';
import { verifyToken } from '../../shared/auth.js.ts';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Authenticated request with user data
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

/**
 * Validation error for request validation failures
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Authorization error for permission failures
 */
export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Internal server error for service failures
 */
export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}

// =============================================================================
// SERVICE INTERFACE (for dependency injection and testing)
// =============================================================================

/**
 * Interface for prediction service operations
 */
interface IPredictionService {
  /**
   * Get all inventory items
   */
  getInventoryItems(): Promise<InventoryItem[]>;
  
  /**
   * Generate demand prediction for a single item
   */
  generatePrediction(item: InventoryItem, predictionDate: string): DemandPrediction;
}

/**
 * Default prediction service implementation
 */
class PredictionService implements IPredictionService {
  /**
   * Get inventory items - would normally call inventory service or database
   * For now, returns empty array (to be integrated with inventory service)
   */
  async getInventoryItems(): Promise<InventoryItem[]> {
    // In a real implementation, this would call the inventory service or database
    // For the prediction service demo, we return simulated data
    // TODO: Integrate with inventory service via HTTP call or shared database
    return [];
  }
  
  /**
   * Generate demand prediction for a single inventory item
   * Uses a simple prediction algorithm based on historical patterns
   */
  generatePrediction(item: InventoryItem, predictionDate: string): DemandPrediction {
    // Simple prediction algorithm:
    // - Base demand is current quantity
    // - Adjust based on days until expiration
    // - Higher urgency for items expiring soon
    const today = new Date();
    const expDate = new Date(item.expirationDate);
    const daysUntilExpiration = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Calculate predicted demand (simplified algorithm)
    let predictedDemand = item.quantity;
    
    // If expiring soon, predict higher demand to reduce waste
    if (daysUntilExpiration <= 3) {
      predictedDemand = Math.ceil(item.quantity * 1.5);
    } else if (daysUntilExpiration <= 7) {
      predictedDemand = Math.ceil(item.quantity * 1.2);
    }
    
    // Confidence based on how well we can predict (higher for fresh items)
    let confidence = 0.85;
    if (daysUntilExpiration <= 3) {
      confidence = 0.95; // Very urgent - high confidence to take action
    } else if (daysUntilExpiration <= 7) {
      confidence = 0.90;
    } else if (daysUntilExpiration <= 14) {
      confidence = 0.75;
    } else {
      confidence = 0.70;
    }
    
    return {
      itemId: item.id,
      itemName: item.name,
      predictedDemand,
      predictionDate,
      confidence,
    };
  }
}

// =============================================================================
// CONTROLLER IMPLEMENTATION
// =============================================================================

/**
 * Prediction service instance (can be replaced for testing)
 */
let predictionService: IPredictionService = new PredictionService();

/**
 * Set the prediction service (for dependency injection/testing)
 */
export function setPredictionService(service: IPredictionService): void {
  predictionService = service;
}

/**
 * Authorized roles for accessing predictions
 * Admin, Manager, and Chef can access predictions
 * Staff cannot access predictions
 */
const AUTHORIZED_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF];

/**
 * Check if a role is authorized to access predictions
 */
function isAuthorized(role: string): boolean {
  return AUTHORIZED_ROLES.includes(role as UserRole);
}

/**
 * Validate prediction date format (YYYY-MM-DD)
 */
function isValidDate(dateStr: string): boolean {
  // ISO8601 date format validation (YYYY-MM-DD)
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(dateStr)) return false;
  const parsedDate = new Date(dateStr);
  return !isNaN(parsedDate.getTime());
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

/**
 * Demand prediction endpoint handler
 */
export async function getDemandPredictionsHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check authentication
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Missing user authentication' });
      return;
    }
    // Check authorization
    if (!isAuthorized(req.user.role)) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
      return;
    }
    // Parse and validate prediction date
    const predictionDate = req.query.date as string || new Date().toISOString().slice(0, 10);
    if (!isValidDate(predictionDate)) {
      res.status(400).json({ error: 'Bad Request', message: 'Invalid date format. Expected YYYY-MM-DD' });
      return;
    }
    // Get inventory items
    const items = await predictionService.getInventoryItems();
    // Generate predictions
    const predictions: DemandPrediction[] = items.map(item =>
      predictionService.generatePrediction(item, predictionDate)
    );
    const response: DemandPredictionResponse = {
      predictions,
      generatedAt: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
