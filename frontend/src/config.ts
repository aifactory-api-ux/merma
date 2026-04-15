/**
 * Merma Project - Frontend Configuration
 * 
 * Environment-based configuration for API endpoints.
 * Uses Vite environment variables.
 * 
 * Version: 1.0.0
 */

// API Base URL from environment (Vite uses import.meta.env.VITE_*)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Service endpoints
const SERVICES = {
  auth: `${API_BASE_URL}/api/auth`,
  inventory: `${API_BASE_URL}/api/inventory`,
  predictions: `${API_BASE_URL}/api/predictions`,
  recommendations: `${API_BASE_URL}/api/recommendations`,
  alerts: `${API_BASE_URL}/api/alerts`,
};

// Export configuration object
export const config = {
  api: {
    baseUrl: API_BASE_URL,
    services: SERVICES,
    timeout: 30000,
  },
  app: {
    name: 'Merma',
    version: '1.0.0',
  },
  features: {
    enablePredictions: true,
    enableAlerts: true,
    enableRecommendations: true,
  },
};

// Export service URLs for direct access
export const API_ENDPOINTS = SERVICES;
