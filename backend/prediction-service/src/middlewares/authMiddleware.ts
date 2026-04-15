/**
 * Merma Project - Prediction Service Auth Middleware
 * 
 * JWT authentication and RBAC middleware for prediction service.
 * Validates JWT tokens and verifies user role permissions.
 * 
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JsonWebTokenError } from '../../../shared/auth.js';
import { UserRole } from '../../../shared/models.js';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Authenticated request with user data
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

/**
 * Configuration options for auth middleware
 */
interface AuthMiddlewareOptions {
  /**
   * Array of permitted roles. If empty, all authenticated users are allowed.
   */
  permittedRoles?: UserRole[];
  /**
   * Whether to require authentication (default: true)
   */
  requireAuth?: boolean;
}

// =============================================================================
// CUSTOM ERROR CLASSES
// =============================================================================

/**
 * Authentication error for invalid or missing tokens
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error for insufficient permissions
 */
export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// =============================================================================
// MIDDLEWARE FACTORY
// =============================================================================

/**
 * Create authentication middleware with optional role checking
 * 
 * @param options - Middleware configuration options
 * @returns Express middleware function
 * 
 * @example
 * // Require authentication for any valid user
 * const authMiddleware = createAuthMiddleware();
 * 
 * @example
 * // Require authentication and admin role only
 * const adminMiddleware = createAuthMiddleware({
 *   permittedRoles: [UserRole.ADMIN]
 * });
 * 
 * @example
 * // Require authentication with multiple roles
 * const staffMiddleware = createAuthMiddleware({
 *   permittedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF]
 * });
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  const { permittedRoles = [], requireAuth = true } = options;

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // If authentication is not required, skip JWT validation
    if (!requireAuth) {
      next();
      return;
    }

    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check for missing Authorization header
    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing authorization header'
      });
      return;
    }

    // Validate Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Expected: Bearer <token>'
      });
      return;
    }

    // Extract token from Bearer prefix
    const token = authHeader.substring(7);

    // Check for empty token
    if (!token || token.trim() === '') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing JWT token'
      });
      return;
    }

    try {
      // Verify and decode the JWT token
      const user = verifyToken(token);

      // Attach user to request object
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      // Check role permissions if permittedRoles is specified
      if (permittedRoles.length > 0) {
        const userRole = user.role as UserRole;
        const isPermitted = permittedRoles.includes(userRole);

        if (!isPermitted) {
          res.status(403).json({
            error: 'Forbidden',
            message: 'Insufficient permissions for this resource'
          });
          return;
        }
      }

      // Authentication and authorization successful
      next();
    } catch (error) {
      // Handle specific JWT errors
      if (error instanceof JsonWebTokenError) {
        const message = error.message.toLowerCase();
        
        // Check for token expiration
        if (message.includes('expired') || message.includes('jwt expired')) {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'JWT token has expired'
          });
          return;
        }

        // Handle other JWT validation errors (invalid signature, malformed token, etc.)
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid JWT token'
        });
        return;
      }

      // Handle unexpected errors
      console.error('Auth middleware unexpected error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed unexpectedly'
      });
    }
  };
}

// =============================================================================
// PRE-CONFIGURED MIDDLEWARE
// =============================================================================

/**
 * Default auth middleware - requires authentication for any valid user
 * Allows access to all authenticated roles
 */
export const authMiddleware = createAuthMiddleware();

/**
 * Admin-only middleware - restricts access to admin users only
 */
export const adminOnlyMiddleware = createAuthMiddleware({
  permittedRoles: [UserRole.ADMIN]
});

/**
 * Manager or above middleware - restricts access to admin and manager roles
 */
export const managerOnlyMiddleware = createAuthMiddleware({
  permittedRoles: [UserRole.ADMIN, UserRole.MANAGER]
});

/**
 * Staff or above middleware - restricts access to admin, manager, chef, and staff roles
 * This is essentially the same as authMiddleware but more explicit
 */
export const staffAndAboveMiddleware = createAuthMiddleware({
  permittedRoles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.STAFF]
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a user role is permitted
 * 
 * @param userRole - The user's role to check
 * @param permittedRoles - Array of permitted roles
 * @returns true if user role is permitted, false otherwise
 */
export function isRolePermitted(userRole: string, permittedRoles: UserRole[]): boolean {
  if (permittedRoles.length === 0) {
    return true; // If no roles specified, all roles are permitted
  }
  return permittedRoles.includes(userRole as UserRole);
}

/**
 * Extract user info from request (safe extraction)
 * 
 * @param req - Express request object
 * @returns User info object or null if not authenticated
 */
export function getUserFromRequest(req: AuthenticatedRequest): { id: number; email: string; role: string } | null {
  if (req.user) {
    return {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    };
  }
  return null;
}
