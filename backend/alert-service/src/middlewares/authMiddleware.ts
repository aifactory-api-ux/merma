/**
 * Alert Service - Auth Middleware
 * 
 * JWT authentication and RBAC middleware for protected routes
 * Provides comprehensive authentication and authorization for all alert service endpoints
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
export interface AuthenticatedRequest extends Request {
  user?: UserSummary;
}

/**
 * Options for role-based authorization middleware
 */
export interface RoleAuthOptions {
  requiredRoles?: UserRole[];
}

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

/**
 * Authentication middleware to verify JWT token
 * 
 * This middleware checks for a valid Bearer token in the Authorization header
 * and attaches the user information to the request object.
 * Returns 401 if token is missing or invalid.
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
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header missing' });
    return;
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Authorization format must be: Bearer <token>' });
    return;
  }
  
  const token = parts[1];
  
  try {
    const user = verifyToken(token);
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// =============================================================================
// ROLE-BASED AUTHORIZATION MIDDLEWARE
// =============================================================================

/**
 * Create role-based authorization middleware
 * 
 * Use this factory function to create middleware that checks
 * if the authenticated user has one of the required roles.
 * Returns 403 if user's role is not in the required roles list.
 * 
 * @param options - Configuration options including required roles
 * @returns Express middleware function
 * 
 * @example
 * ```typescript
 * const requireAdmin = roleAuthMiddleware({ requiredRoles: [UserRole.ADMIN] });
 * router.get('/admin-only', requireAdmin, handler);
 * ```
 */
export function roleAuthMiddleware(options: RoleAuthOptions) {
  const { requiredRoles = [] } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    
    // First check if user is authenticated
    if (!authReq.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    // If no roles specified, allow any authenticated user
    if (requiredRoles.length === 0) {
      next();
      return;
    }
    
    // Check if user's role is in the required roles list
    if (!requiredRoles.includes(authReq.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        requiredRoles: requiredRoles,
        userRole: authReq.user.role
      });
      return;
    }
    
    next();
  };
}

// =============================================================================
// OPTIONAL AUTHENTICATION MIDDLEWARE
// =============================================================================

/**
 * Optional authentication middleware
 * 
 * Attaches user info if token is present but doesn't require it.
 * If no token is provided, request proceeds without user attached.
 * This is useful for endpoints that can work with or without auth.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    next();
    return;
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    next();
    return;
  }
  
  const token = parts[1];
  
  try {
    const user = verifyToken(token);
    (req as AuthenticatedRequest).user = user;
  } catch {
    // Token invalid but not required - continue without user
  }
  
  next();
}
