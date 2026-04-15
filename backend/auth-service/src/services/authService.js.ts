/**
 * Merma Project - Auth Service
 * 
 * Business logic for authentication operations.
 * Handles user validation and data access.
 * 
 * Version: 1.0.0
 */

import { getDataSource, getDatabaseConfig } from '../../shared/db.js';
import { UserEntity, UserRole } from '../../shared/models.js';
import { validatePassword } from '../../shared/auth.js.ts';

/**
 * User entity structure for authentication
 */
interface UserEntityData {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  private dataSourceInitialized = false;

  /**
   * Initialize database connection if not already done
   */
  private async ensureDataSource(): Promise<void> {
    if (!this.dataSourceInitialized) {
      const config = getDatabaseConfig();
      await getDataSource(config);
      this.dataSourceInitialized = true;
    }
  }

  /**
   * Validate user credentials (email and password)
   * 
   * @param email - User's email address
   * @param password - Plain text password
   * @returns User entity if valid, null otherwise
   */
  async validateCredentials(
    email: string,
    password: string
  ): Promise<UserEntityData | null> {
    await this.ensureDataSource();

    const dataSource = await getDataSource(getDatabaseConfig());
    const userRepository = dataSource.getRepository(UserEntity);

    // Find user by email
    const user = await userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Validate password
    const isValid = await validatePassword(password, user.passwordHash);
    
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get user by ID
   * 
   * @param id - User's unique identifier
   * @returns User entity if found, null otherwise
   */
  async getUserById(id: number): Promise<UserEntityData | null> {
    await this.ensureDataSource();

    const dataSource = await getDataSource(getDatabaseConfig());
    const userRepository = dataSource.getRepository(UserEntity);

    const user = await userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get user by email
   * 
   * @param email - User's email address
   * @returns User entity if found, null otherwise
   */
  async getUserByEmail(email: string): Promise<UserEntityData | null> {
    await this.ensureDataSource();

    const dataSource = await getDataSource(getDatabaseConfig());
    const userRepository = dataSource.getRepository(UserEntity);

    const user = await userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
