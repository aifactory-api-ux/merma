/**
 * Merma Project - Auth Controller
 * 
 * Handles authentication logic: login and user info retrieval.
 * 
 * Version: 1.0.0
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { AuthRequest, AuthResponse, UserSummary } from '../../shared/models.js.ts';
import { verifyToken, generateToken } from '../../shared/auth.js.ts';

/**
 * Auth Controller
 * Handles HTTP requests for authentication endpoints
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/login
   * 
   * Authenticate user with email and password.
   * Returns JWT token and user summary.
   * 
   * @req { email: string, password: string }
   * @res { token: string, user: UserSummary }
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as AuthRequest;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Email and password are required',
        });
        return;
      }

      // Validate credentials with auth service
      const user = await this.authService.validateCredentials(email, password);
      
      if (!user) {
        res.status(401).json({
          error: 'Invalid email or password',
        });
        return;
      }

      // Create user summary for token generation
      const userSummary: UserSummary = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      // Generate JWT token
      const token = generateToken(userSummary);

      const response: AuthResponse = {
        token,
        user: userSummary,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'An error occurred during login',
      });
    }
  }

  /**
   * GET /api/auth/me
   * 
   * Get current authenticated user's info from JWT token.
   * Expects Authorization header with Bearer token.
   * 
   * @res UserSummary
   */
  async getUserInfo(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is attached to request by auth middleware
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
        });
        return;
      }

      // Return user summary from authenticated request
      const userSummary: UserSummary = {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      };

      res.status(200).json(userSummary);
    } catch (error) {
      console.error('Get user info error:', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'An error occurred while fetching user info',
      });
    }
  }
}

export default AuthController;
