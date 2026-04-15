/**
 * Merma Project - Shared Auth Module (JS Format)
 * 
 * Provides JWT token generation and verification utilities.
 * Used by all backend services for authentication.
 * 
 * Version: 1.0.0
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'merma-default-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Token payload interface
 */
export interface TokenPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * User summary interface
 */
export interface UserSummary {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'chef' | 'staff';
}

/**
 * Generate a JWT token for a user
 * 
 * @param user - User summary to encode in token
 * @returns Generated JWT token string
 * @throws Error if token generation fails
 */
export function generateToken(user: UserSummary): string {
  if (!user || !user.id || !user.email || !user.role) {
    throw new Error('Invalid user object: missing required fields');
  }
  
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  
  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRY,
  };
  
  try {
    const token = jwt.sign(payload, JWT_SECRET, options);
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token string
 * @returns UserSummary if token is valid
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): UserSummary {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token: token is required');
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
      throw new Error('Invalid token payload: missing required fields');
    }
    
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Extract token from Authorization header
 * Expects header in format: "Bearer <token>"
 * 
 * @param authHeader - Authorization header value
 * @returns Extracted token or null if invalid format
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return token || null;
}

/**
 * Refresh an existing token with new expiry
 * 
 * @param token - Current JWT token
 * @returns New JWT token with extended expiry
 */
export function refreshToken(token: string): string {
  const user = verifyToken(token);
  return generateToken(user);
}

/**
 * Decode token without verification (for debugging)
 * 
 * @param token - JWT token string
 * @returns Decoded payload without verification
 */
export functiondecodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export default {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  refreshToken,
  decodeToken,
};
