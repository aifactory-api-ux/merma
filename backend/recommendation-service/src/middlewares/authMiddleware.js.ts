/**
 * Merma Project - Authentication Middleware (JS Format)
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ExtendableError = (function (_super) {
    __extends(ExtendableError, _super);
    function ExtendableError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'ExtendableError';
        Error.captureStackTrace.call(_this, ExtendableError);
        return _this;
    }
    return ExtendableError;
})(Error);

// Check if global Express namespace already has Request with user property
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
export function extractToken(authHeader) {
    if (!authHeader) {
        return null;
    }
    var parts = authHeader.split(' ');
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
export function authMiddleware(req, res, next) {
    try {
        var token = extractToken(req.headers.authorization);
        if (!token) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Missing or invalid authorization header',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        var user = verifyToken(token);
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
