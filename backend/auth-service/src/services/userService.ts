/**
 * Merma Project - User Service
 * 
 * Data access layer for user operations.
 * Handles database queries for user retrieval and validation.
 * 
 * Version: 1.0.0
 */

import { getDataSource } from '@merma/shared/db.js';
import { UserEntity, User, UserRole } from '@merma/shared/models.js';
import { validatePassword } from '@merma/shared/auth.js';

/**
 * User data structure returned from database queries
 */
interface UserData {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Initialize the data source connection
 * This ensures database connection is established before queries
 */
async function initializeDataSource(): Promise<void> {
  const { getDatabaseConfig } = await import('@merma/shared/db.js');
  const config = getDatabaseConfig();
  await getDataSource(config);
}

/**
 * Find a user by their email address
 * 
 * @param email - User's email address to search for
 * @returns User object if found, null otherwise
 * @throws Error if database query fails
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  await initializeDataSource();
  
  const { getDatabaseConfig, getDataSource } = await import('@merma/shared/db.js');
  const config = getDatabaseConfig();
  const dataSource = await getDataSource(config);
  
  const userRepository = dataSource.getRepository(UserEntity);
  
  const user = await userRepository.findOne({
    where: { email },
  });

  if (!user) {
    return null;
  }

  // Map entity to User interface
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * Validate a password against a stored hash
 * 
 * @param password - Plain text password to validate
 * @param hash - Stored password hash to compare against
 * @returns true if password matches hash, false otherwise
 * @throws Error if validation process fails
 */
export async function validatePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return validatePassword(password, hash);
}

/**
 * Find a user by their unique ID
 * 
 * @param id - User's unique identifier
 * @returns User object if found, null otherwise
 * @throws Error if database query fails
 */
export async function findUserById(id: number): Promise<User | null> {
  await initializeDataSource();
  
  const { getDatabaseConfig, getDataSource } = await import('@merma/shared/db.js');
  const config = getDatabaseConfig();
  const dataSource = await getDataSource(config);
  
  const userRepository = dataSource.getRepository(UserEntity);
  
  const user = await userRepository.findOne({
    where: { id },
  });

  if (!user) {
    return null;
  }

  // Map entity to User interface
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
