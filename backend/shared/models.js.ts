/**
 * Merma Project - Shared Models (JS Format)
 * 
 * Common TypeScript interfaces for all backend services.
 * This file provides JavaScript-compatible type definitions.
 * 
 * Version: 1.0.0
 */

/**
 * User roles in the system
 */
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["CHEF"] = "chef";
    UserRole["STAFF"] = "staff";
})(UserRole || (UserRole = {}));

/**
 * Recommendation action types
 */
export var RecommendationAction;
(function (RecommendationAction) {
    RecommendationAction["ORDER_MORE"] = "order_more";
    RecommendationAction["REDUCE_STOCK"] = "reduce_stock";
    RecommendationAction["PROMOTE_SALE"] = "promote_sale";
    RecommendationAction["MONITOR"] = "monitor";
})(RecommendationAction || (RecommendationAction = {}));

/**
 * Alert types
 */
export var AlertType;
(function (AlertType) {
    AlertType["RISK"] = "risk";
    AlertType["STOCKOUT"] = "stockout";
    AlertType["EXPIRATION"] = "expiration";
})(AlertType || (AlertType = {}));

/**
 * Alert severity levels
 */
export var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (AlertSeverity = {}));

/**
 * User summary interface (exposed to clients)
 */
export class UserSummary {
    constructor(id, email, role) {
        this.id = id;
        this.email = email;
        this.role = role;
    }
}

/**
 * Auth request interface
 */
export class AuthRequest {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

/**
 * Auth response interface
 */
export class AuthResponse {
    constructor(token, user) {
        this.token = token;
        this.user = user;
    }
}

/**
 * Inventory item interface
 */
export class InventoryItem {
    constructor(id, name, category, quantity, unit, expirationDate, location, lastUpdated) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.quantity = quantity;
        this.unit = unit;
        this.expirationDate = expirationDate;
        this.location = location;
        this.lastUpdated = lastUpdated;
    }
}

/**
 * Inventory overview interface
 */
export class InventoryOverview {
    constructor(totalItems, lowStockItems, expiringSoonItems, totalValue, currency) {
        this.totalItems = totalItems;
        this.lowStockItems = lowStockItems;
        this.expiringSoonItems = expiringSoonItems;
        this.totalValue = totalValue;
        this.currency = currency;
    }
}

/**
 * Demand prediction interface
 */
export class DemandPrediction {
    constructor(itemId, itemName, predictedDemand, predictionDate, confidence) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.predictedDemand = predictedDemand;
        this.predictionDate = predictionDate;
        this.confidence = confidence;
    }
}

/**
 * Demand prediction response interface
 */
export class DemandPredictionResponse {
    constructor(predictions, generatedAt) {
        this.predictions = predictions;
        this.generatedAt = generatedAt;
    }
}

/**
 * Recommendation interface
 */
export class Recommendation {
    constructor(id, itemId, itemName, action, reason, createdAt) {
        this.id = id;
        this.itemId = itemId;
        this.itemName = itemName;
        this.action = action;
        this.reason = reason;
        this.createdAt = createdAt;
    }
}

/**
 * Recommendation response interface
 */
export class RecommendationResponse {
    constructor(recommendations, generatedAt) {
        this.recommendations = recommendations;
        this.generatedAt = generatedAt;
    }
}

/**
 * Alert interface
 */
export class Alert {
    constructor(id, type, message, severity, relatedItemId, createdAt, acknowledged) {
        this.id = id;
        this.type = type;
        this.message = message;
        this.severity = severity;
        this.relatedItemId = relatedItemId;
        this.createdAt = createdAt;
        this.acknowledged = acknowledged;
    }
}

/**
 * Alert response interface
 */
export class AlertResponse {
    constructor(alerts) {
        this.alerts = alerts;
    }
}

export default {
    UserRole,
    RecommendationAction,
    AlertType,
    AlertSeverity,
    UserSummary,
    AuthRequest,
    AuthResponse,
    InventoryItem,
    InventoryOverview,
    DemandPrediction,
    DemandPredictionResponse,
    Recommendation,
    RecommendationResponse,
    Alert,
    AlertResponse
};