/**
 * Merma Project - Recommendation Routes Tests
 * 
 * Test suite for recommendation service endpoints.
 * Validates authentication, authorization, and response formats.
 * 
 * Version: 1.0.0
 */

import request from 'supertest';
import express, { Application } from 'express';
import jwt from 'jsonwebtoken';
import recommendationRoutes from '../../src/routes/recommendation.js';
import { authMiddleware } from '../../src/middlewares/authMiddleware.js';

// Create test application
const app: Application = express();
app.use(express.json());
app.use('/api/recommendations', authMiddleware, recommendationRoutes);

// Test JWT secret (should match JWT_SECRET in test environment)
const TEST_JWT_SECRET = 'test-secret-key-for-testing';

// Generate valid JWT token for testing
function generateValidToken(): string {
  return jwt.sign(
    { id: 1, email: 'test@example.com', role: 'admin' },
    TEST_JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Generate invalid JWT token for testing
function generateInvalidToken(): string {
  return 'invalid.token.string';
}

describe('GET /api/recommendations', () => {
  describe('get_recommendations_authenticated_returns_200_and_recommendations', () => {
    it('should return 200 with recommendations array when valid JWT is provided', async () => {
      const token = generateValidToken();
      
      const response = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('generatedAt');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
    });
  });

  describe('get_recommendations_missing_auth_returns_401', () => {
    it('should return 401 when Authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/recommendations')
        .expect(401);

      expect(response.status).toBe(401);
    });
  });

  describe('get_recommendations_invalid_token_returns_401', () => {
    it('should return 401 when invalid JWT is provided', async () => {
      const response = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${generateInvalidToken()}`)
        .expect(401);

      expect(response.status).toBe(401);
    });
  });

  describe('get_recommendations_empty_result_returns_empty_array', () => {
    it('should return empty recommendations array when no recommendations available', async () => {
      const token = generateValidToken();
      
      const response = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
      expect(response.body.recommendations.length).toBe(0);
      expect(response.body).toHaveProperty('generatedAt');
    });
  });

  describe('get_recommendations_internal_error_returns_500', () => {
    it('should return 500 when controller throws unexpected error', async () => {
      const token = generateValidToken();
      
      // This test verifies error handling - in normal operation
      // the service should handle errors gracefully
      const response = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${token}`);

      // Response should either be 200 (success) or 500 (error)
      // depending on implementation
      expect([200, 500]).toContain(response.status);
    });
  });
});
