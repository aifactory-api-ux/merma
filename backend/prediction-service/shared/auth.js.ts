/**
 * Merma Project - Prediction Service Shared Auth
 * 
 * Shared authentication utilities for the prediction service.
 * Provides JWT token verification compatible with the auth service.
 * 
 * Version: 1.0.0
 */

import { UserSummary } from '../../shared/models.js';

/**
 * JSON Web Token Error class for handling JWT-specific errors
 */
export class JsonWebTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JsonWebTokenError';
  }
}

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token string
 * @returns UserSummary with decoded user info
 * @throws JsonWebTokenError if token is invalid
 */
export function verifyToken(token: string): UserSummary {
  try {
    // Decode base64 token (simple implementation for demo)
    // In production, use proper JWT verification with jsonwebtoken library
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new JsonWebTokenError('Invalid token format');
    }

    // Decode payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    if (!payload.id || !payload.email || !payload.role) {
      throw new JsonWebTokenError('Invalid token payload');
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw error;
    }
    throw new JsonWebTokenError('Token verification failed');
  }
}

/**
 * Generate a JWT token (for service-to-service communication)
 * 
 * @param user - User summary to encode in token
 * @returns Generated JWT token string
 */
export function generateToken(user: UserSummary): string {
  // Create a simple JWT-like token (base64 encoded JSON)
  // In production, use jsonwebtoken library with proper signing
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify(user)).toString('base64');
  const signature = Buffer.from('mock-signature').toString('base64');
  
  return `${header}.${payload}.${signature}`;
}

export default { verifyToken, generateToken, JsonWebTokenError };
