/**
 * Merma Project - Auth Service Shared Auth
 * 
 * Shared authentication utilities for the auth service.
 * Provides JWT token verification and related functions.
 * This module re-exports from the shared backend auth module.
 * 
 * Version: 1.0.0
 */

// Re-export all functions from the main shared auth module
// The authMiddleware.js.ts imports from this path: ../../shared/auth.js
export { verifyToken, generateToken } from '../../../shared/auth.js';
export type { UserSummary } from '../../../shared/models.js';

// Also export locally for direct imports if needed
export { verifyToken as verifyTokenLocal, generateToken as generateTokenLocal } from '../../../shared/auth.js';
