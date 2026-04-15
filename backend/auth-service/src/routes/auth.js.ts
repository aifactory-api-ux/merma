/**
 * Merma Project - Auth Routes
 * 
 * Authentication endpoints: login and user info.
 * 
 * Version: 1.0.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthController } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const authController = new AuthController();

// =============================================================================
// VALIDATION MIDDLEWARE
// =============================================================================

/**
 * Validate request body and return errors if validation fails
 */
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const field = firstError.path || 'request parameters';
    const msg = firstError.msg || 'Invalid value';
    
    // Map specific validation errors to expected error messages
    if (field === 'email' && msg.includes('email')) {
      res.status(400).json({ error: 'email is required' });
      return;
    }
    if (field === 'password' && msg.includes('empty')) {
      res.status(400).json({ error: 'password is required' });
      return;
    }
    
    res.status(400).json({
      error: 'ValidationError',
      message: `Invalid ${field}: ${msg}`,
    });
    return;
  }
  next();
};

// =============================================================================
// LOGIN ENDPOINT
// =============================================================================

/**
 * POST /api/auth/login
 * 
 * Authenticate user and return JWT token.
 * Request: { email: string, password: string }
 * Response: { token: string, user: UserSummary }
 */
router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('email is required').isEmail().withMessage('email is required'),
    body('password').notEmpty().withMessage('password is required'),
  ],
  validateRequest,
  (req: Request, res: Response, next: NextFunction) => {
    authController.login(req, res).catch(next);
  }
);

// =============================================================================
// ME ENDPOINT
// =============================================================================

/**
 * GET /api/auth/me
 * 
 * Get current authenticated user info.
 * Requires Bearer JWT token.
 * Response: UserSummary
 */
router.get(
  '/me',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    authController.getUserInfo(req, res).catch(next);
  }
);

// Export router
export const authRouter = router;
export default router;
