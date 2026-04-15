/**
 * Merma Project - Prediction Service
 * 
 * Handles demand prediction business logic for inventory items.
 * Generates predictions based on inventory data and historical patterns.
 * 
 * Version: 1.0.0
 */

import {
  DemandPrediction,
  DemandPredictionResponse,
  InventoryItem,
} from '../../shared/models.js';

// =============================================================================
// CUSTOM ERROR CLASSES
// =============================================================================

/**
 * Validation error for request validation failures
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// =============================================================================
// SERVICE INTERFACE
// =============================================================================

/**
 * Interface for prediction service operations
 */
export interface IPredictionService {
  /**
   * Get demand predictions for all inventory items
   * @param date - Optional prediction date in ISO8601 format
   * @returns Promise<DemandPredictionResponse>
   */
  getDemandPredictions(date?: string): Promise<DemandPredictionResponse>;
  
  /**
   * Generate demand prediction for a single inventory item
   * @param item - Inventory item to predict demand for
   * @param predictionDate - Date for the prediction
   * @returns DemandPrediction
   */
  generatePrediction(item: InventoryItem, predictionDate: string): DemandPrediction;
  
  /**
   * Validate prediction date format
   * @param date - Date string to validate
   * @throws ValidationError if date is invalid
   */
  validateDate(date: string): void;
  
  /**
   * Validate inventory items array
   * @param items - Inventory items array to validate
   * @throws ValidationError if items is null or undefined
   */
  validateInventoryItems(items: InventoryItem[] | null): void;
}

// =============================================================================
// PREDICTION SERVICE IMPLEMENTATION
// =============================================================================

/**
 * Prediction service implementation
 * Generates demand predictions for inventory items based on
 * quantity, category, and expiration date patterns.
 */
export class PredictionService implements IPredictionService {
  /**
   * Get demand predictions for all inventory items
   * @param date - Optional prediction date in ISO8601 format (YYYY-MM-DD)
   * @returns Promise<DemandPredictionResponse>
   * @throws ValidationError if date format is invalid
   * @throws ValidationError if inventory items is null
   */
  async getDemandPredictions(date?: string): Promise<DemandPredictionResponse> {
    // Use provided date or default to today
    const predictionDate = date || this.getCurrentDate();
    
    // Validate the date format
    this.validateDate(predictionDate);
    
    // Get inventory items (in production, this would fetch from database)
    const inventoryItems = await this.getInventoryItems();
    
    // Validate inventory items
    this.validateInventoryItems(inventoryItems);
    
    // Generate predictions for each item
    const predictions: DemandPrediction[] = inventoryItems.map(item =>
      this.generatePrediction(item, predictionDate)
    );
    
    return {
      predictions,
      generatedAt: new Date().toISOString(),
    };
  }
  
  /**
   * Generate demand prediction for a single inventory item
   * @param item - Inventory item to predict demand for
   * @param predictionDate - Date for the prediction
   * @returns DemandPrediction
   */
  generatePrediction(item: InventoryItem, predictionDate: string): DemandPrediction {
    // Calculate predicted demand based on quantity, category, and expiration
    const baseDemand = this.calculateBaseDemand(item);
    const confidence = this.calculateConfidence(item);
    
    return {
      itemId: item.id,
      itemName: item.name,
      predictedDemand: Math.round(baseDemand * 100) / 100,
      predictionDate,
      confidence: Math.round(confidence * 100) / 100,
    };
  }
  
  /**
   * Validate prediction date format (ISO8601: YYYY-MM-DD)
   * @param date - Date string to validate
   * @throws ValidationError if date is invalid
   */
  validateDate(date: string): void {
    if (!date) {
      throw new ValidationError('Date is required');
    }
    
    // ISO8601 date format validation (YYYY-MM-DD)
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(date)) {
      throw new ValidationError('Invalid date format. Expected ISO8601 format: YYYY-MM-DD');
    }
    
    // Validate that it's a valid date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new ValidationError('Invalid date format. Expected ISO8601 format: YYYY-MM-DD');
    }
    
    // Check if date is not in the future (more than 1 year ahead)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (parsedDate > oneYearFromNow) {
      throw new ValidationError('Prediction date cannot be more than 1 year in the future');
    }
  }

  /**
   * Validate inventory items array
   * @param items - Inventory items array to validate
   * @throws ValidationError if items is null or undefined
   */
  validateInventoryItems(items: InventoryItem[] | null): void {
    if (!items || !Array.isArray(items)) {
      throw new ValidationError('Inventory items not found');
    }
  }

  /**
   * Calculate base demand for an inventory item
   * @param item - Inventory item
   * @returns number
   */
  private calculateBaseDemand(item: InventoryItem): number {
    // Simple base demand: 30% of current quantity
    return item.quantity * 0.3;
  }

  /**
   * Calculate confidence for a prediction
   * @param item - Inventory item
   * @returns number
   */
  private calculateConfidence(item: InventoryItem): number {
    // Confidence decreases as expiration approaches
    const now = new Date();
    const expiry = new Date(item.expirationDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let confidence = 0.85;
    if (daysUntilExpiry < 3) confidence -= 0.1;
    if (daysUntilExpiry < 0) confidence -= 0.3;
    confidence = Math.max(0.1, Math.min(1.0, confidence));
    return confidence;
  }

  /**
   * Get current date in YYYY-MM-DD format
   * @returns string
   */
  private getCurrentDate(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }

  /**
   * Get inventory items (stub for now)
   * @returns Promise<InventoryItem[]>
   */
  async getInventoryItems(): Promise<InventoryItem[]> {
    // Use shared models stub for now
    return [];
  }
}
