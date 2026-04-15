/**
 * Merma Project - Alert Service Shared Auth
 * 
 * Shared authentication utilities for the alert service.
 * Provides JWT token verification and related functions.
 * 
 * Version: 1.0.0
 */

import { verifyToken as sharedVerifyToken, generateToken } from '../../shared/auth.js';
import { UserSummary, UserRole } from '../../shared/models.js';

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token string
 * @returns UserSummary if token is valid
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): UserSummary {
  return sharedVerifyToken(token);
}

/**
 * Generate a JWT token for a user
 * 
 * @param user - User summary to encode in token
 * @returns Generated JWT token string
 */
export function generateToken(user: UserSummary): string {
  return generateToken(user);
}

/**
 * Authenticated user interface
 */
export interface AuthenticatedUser {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'chef' | 'staff';
}

export default {
  verifyToken,
  generateToken,
};
