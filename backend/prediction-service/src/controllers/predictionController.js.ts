/**
 * Merma Project - Prediction Controller
 * 
 * Handles demand prediction endpoint requests.
 * Generates demand predictions for inventory items.
 * 
 * Version: 1.0.0
 */

const {
  DemandPrediction,
  DemandPredictionResponse,
  InventoryItem
} = require('../../shared/models.js');

const { verifyToken } = require('../../shared/auth.js');

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Authenticated request with user data
 * @typedef {Object} AuthenticatedRequest
 * @property {Object} user - Authenticated user info
 * @property {number} user.id - User ID
 * @property {string} user.email - User email
 * @property {string} user.role - User role
 */

/**
 * Validation error for request validation failures
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Authorization error for permission failures
 */
class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Internal server error for service failures
 */
class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InternalServerError';
  }
}

// =============================================================================
// SERVICE IMPLEMENTATION
// =============================================================================

/**
 * IPredictionService interface
 */
const IPredictionService = {
  /**
   * Get all inventory items
   * @returns {Promise<InventoryItem[]>}
   */
  getInventoryItems: async function() {
    throw new Error('Not implemented');
  },
  
  /**
   * Generate demand prediction for a single item
   * @param {InventoryItem} item - Inventory item
   * @param {string} predictionDate - Prediction date
   * @returns {DemandPrediction}
   */
  generatePrediction: function(item, predictionDate) {
    throw new Error('Not implemented');
  }
};

/**
 * PredictionService implementation
 */
class PredictionService {
  /**
   * Get inventory items from database or inventory service
   * @returns {Promise<InventoryItem[]>}
   */
  async getInventoryItems() {
    // In production, this would call inventory service or database
    // For now, return sample data for demonstration
    const sampleItems = [
      {
        id: 1,
        name: 'Tomatoes',
        category: 'vegetables',
        quantity: 50,
        unit: 'kg',
        expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'Storage A',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Lettuce',
        category: 'vegetables',
        quantity: 30,
        unit: 'kg',
        expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'Storage B',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Chicken Breast',
        category: 'meat',
        quantity: 25,
        unit: 'kg',
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'Cold Storage',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Salmon',
        category: 'seafood',
        quantity: 15,
        unit: 'kg',
        expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'Freezer',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Bread',
        category: 'bakery',
        quantity: 100,
        unit: 'units',
        expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'Bakery Area',
        lastUpdated: new Date().toISOString()
      }
    ];
    return sampleItems;
  }
  
  /**
   * Generate demand prediction for a single inventory item
   * Uses a prediction algorithm based on historical patterns
   * @param {InventoryItem} item - Inventory item
   * @param {string} predictionDate - Prediction date
   * @returns {DemandPrediction}
   */
  generatePrediction(item, predictionDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(item.expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const daysUntilExpiration = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Calculate predicted demand based on urgency
    let predictedDemand = item.quantity;
    
    // If expiring soon, predict higher demand to reduce waste
    if (daysUntilExpiration <= 3) {
      predictedDemand = Math.ceil(item.quantity * 1.5);
    } else if (daysUntilExpiration <= 7) {
      predictedDemand = Math.ceil(item.quantity * 1.2);
    } else if (daysUntilExpiration <= 14) {
      predictedDemand = item.quantity;
    } else {
      predictedDemand = Math.ceil(item.quantity * 0.8);
    }
    
    // Confidence calculation
    let confidence = 0.85;
    if (daysUntilExpiration <= 3) {
      confidence = 0.95;
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
      confidence
    };
  }
}

// =============================================================================
// CONTROLLER STATE
// =============================================================================

/**
 * Prediction service instance
 */
let predictionService = new PredictionService();

/**
 * Set the prediction service (for dependency injection/testing)
 * @param {Object} service - Prediction service instance
 */
function setPredictionService(service) {
  predictionService = service;
}

/**
 * Authorized roles for accessing predictions
 */
const AUTHORIZED_ROLES = ['admin', 'manager', 'chef'];

/**
 * Check if a role is authorized to access predictions
 * @param {string} role - User role
 * @returns {boolean}
 */
function isAuthorized(role) {
  return AUTHORIZED_ROLES.includes(role);
}

/**
 * Validate prediction date format (YYYY-MM-DD)
 * @param {string} dateStr - Date string
 * @returns {boolean}
 */
function isValidDate(dateStr) {
  const isoDateRegex = /^\d{4}-\u00d{2}-\u00d{2}$/;
  if (!isoDateRegex.test(dateStr)) return false;
  const parsedDate = new Date(dateStr);
  return !isNaN(parsedDate.getTime());
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

/**
 * Demand prediction endpoint handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function getDemandPredictionsHandler(req, res, next) {
  try {
    // Check authentication via auth middleware population
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing user authentication'
      });
      return;
    }
    
    // Check authorization
    if (!isAuthorized(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
      return;
    }
    
    // Parse and validate prediction date
    const predictionDate = req.query.date || new Date().toISOString().slice(0, 10);
    if (!isValidDate(predictionDate)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid date format. Expected YYYY-MM-DD'
      });
      return;
    }
    
    // Get inventory items from service
    const items = await predictionService.getInventoryItems();
    
    // Generate predictions for each item
    const predictions = items.map(item =>
      predictionService.generatePrediction(item, predictionDate)
    );
    
    // Build response
    const response = {
      predictions,
      generatedAt: new Date().toISOString()
    };
    
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Classes
  ValidationError,
  AuthorizationError,
  InternalServerError,
  PredictionService,
  
  // Functions
  setPredictionService,
  getDemandPredictionsHandler,
  isAuthorized,
  isValidDate
};
