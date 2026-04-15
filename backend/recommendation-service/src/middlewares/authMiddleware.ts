/**
 * Merma Project - Authentication Middleware
 * 
 * JWT token validation middleware for protecting API endpoints.
 * Validates Bearer token and attaches user info to request.
 * 
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/auth.js';
import { UserSummary } from '../../shared/models.js';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserSummary;
    }
  }
}

/**
 * Extract token from Authorization header
 * 
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Authentication middleware factory
 * 
 * Validates JWT token from Authorization header and attaches
 * user information to the request object.
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
    const token = extractToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const user = verifyToken(token);
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }
}

export default authMiddleware;
