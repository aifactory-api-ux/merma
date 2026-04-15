/**
 * Merma Project - Alert Service Auth Middleware
 * 
 * JWT authentication middleware for protecting alert service routes.
 * Validates Bearer token and attaches user info to request.
 * Also provides RBAC (Role-Based Access Control) capabilities.
 * 
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/auth.js';
import { UserSummary, UserRole } from '../../shared/models.js';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Extended Request interface with authenticated user
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserSummary;
    }
  }
}

/**
 * Options for role-based authorization middleware
 */
export interface RoleAuthOptions {
  requiredRoles?: UserRole[];
}

// =============================================================================
// TOKEN EXTRACTION
// =============================================================================

/**
 * Extract Bearer token from Authorization header
 * 
 * @param authHeader - Authorization header value
 * @returns Token string or null if invalid format
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
}

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

/**
 * Authentication middleware to verify JWT token
 * 
 * This middleware checks for a valid Bearer token in the Authorization header
 * and attaches the user information to the request object.
 * Returns 401 if token is missing, invalid, or expired.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if Authorization header exists
    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    // Extract and validate token
    const token = extractToken(authHeader);
    
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Use: Bearer <token>',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verify token and attach user to request
    try {
      const user = verifyToken(token);
      req.user = user;
      next();
    } catch (tokenError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Authentication middleware error',
      timestamp: new Date().toISOString(),
    });
  }
}

// =============================================================================
// ROLE-BASED AUTHORIZATION MIDDLEWARE
// =============================================================================

/**
 * Create role-based authorization middleware
 * 
 * Factory function that creates middleware to check if the authenticated
 * user has one of the required roles. Returns 403 if user's role is not
 * in the required roles list.
 * 
 * @param options - Configuration options including required roles
 * @returns Express middleware function
 */
export function rbacMiddleware(options: RoleAuthOptions) {
  const { requiredRoles = [] } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // If no roles required, allow access
      if (requiredRoles.length === 0) {
        next();
        return;
      }

      // Check if user's role is in the allowed roles list
      const userRole = req.user.role as UserRole;
      
      if (!requiredRoles.includes(userRole)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions. Required roles: ' + requiredRoles.join(', '),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Authorization middleware error',
        timestamp: new Date().toISOString(),
      });
    }
  };
}

// =============================================================================
// CONVENIENCE MIDDLEWARE EXPORTS
// =============================================================================

/**
 * Middleware that requires admin role
 */
export const requireAdmin = rbacMiddleware({ requiredRoles: [UserRole.ADMIN] });

/**
 * Middleware that requires manager or admin role
 */
export const requireManager = rbacMiddleware({ 
  requiredRoles: [UserRole.ADMIN, UserRole.MANAGER] 
});

/**
 * Middleware that requires any authenticated user
 */
export const requireAuth = authMiddleware;

export default authMiddleware;
