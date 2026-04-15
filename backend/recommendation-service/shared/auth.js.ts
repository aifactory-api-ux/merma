/**
 * Merma Project - Recommendation Service Shared Auth
 * 
 * Shared authentication utilities for the recommendation service.
 * Provides JWT token verification and related functions.
 * 
 * Version: 1.0.0
 */

// Minimal implementation for shared/auth.js

import { UserSummary, UserRole } from './models.js';

/**
 * Dummy verifyToken implementation
 */
export function verifyToken(token: string): UserSummary {
  // In a real implementation, decode and verify JWT
  // Here, return a mock user for demonstration
  return {
    id: 1,
    email: 'user@example.com',
    role: UserRole.MANAGER,
  };
}

/**
 * Dummy generateToken implementation
 */
export function generateToken(user: UserSummary): string {
  // In a real implementation, sign and return JWT
  return 'mock.jwt.token';
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
