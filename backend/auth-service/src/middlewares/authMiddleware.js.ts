/**
 * Merma Project - Auth Middleware
 * 
 * JWT authentication middleware for protecting routes.
 * Extracts and validates Bearer token from Authorization header.
 * Also provides RBAC (Role-Based Access Control) middleware.
 * 
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/auth.js.ts';
import { UserSummary, UserRole } from '../../shared/models.js.ts';

/**
 * Extended request interface to include authenticated user
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserSummary;
    }
  }
}

/**
 * Allowed roles for RBAC
 */
export enum AuthRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CHEF = 'chef',
  STAFF = 'staff',
}

/**
 * Extract and verify JWT token from Authorization header
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
      });
      return;
    }

    // Check Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization header format. Use: Bearer <token>',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token is required',
      });
      return;
    }

    // Verify and decode token
    try {
      const user = verifyToken(token);
      
      // Attach user to request object
      req.user = user;
      
      next();
    } catch (error) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Authentication middleware error',
    });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware factory
 * 
 * @param allowedRoles - Array of roles allowed to access the route
 * @returns Express middleware function
 */
export function rbacMiddleware(allowedRoles: AuthRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Check if user's role is in the allowed roles list
      const userRole = req.user.role as AuthRole;
      
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Authorization middleware error',
      });
    }
  };
}

export default authMiddleware;
