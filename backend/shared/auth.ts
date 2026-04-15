/**
 * Shared authentication utilities for JWT and password hashing.
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserSummary } from './models.js';

// In production, use a secure secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const BCRYPT_SALT_ROUNDS = 10;

export function generateToken(user: UserSummary): string {
  // Only include non-sensitive fields in the token
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): UserSummary {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSummary;
    // Optionally validate structure
    if (!decoded.id || !decoded.email || !decoded.role) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
