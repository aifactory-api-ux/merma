/**
 * Merma Project - Auth Service Shared Models
 * 
 * Local copy of shared models for the auth service.
 * Provides type definitions for users, authentication, and related entities.
 * 
 * Version: 1.0.0
 */

/**
 * User roles in the system
 */
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["CHEF"] = "chef";
    UserRole["STAFF"] = "staff";
})(UserRole || (UserRole = {}));

/**
 * User summary interface (exposed to clients after authentication)
 */
export class UserSummary {
    constructor(id, email, role) {
        this.id = id;
        this.email = email;
        this.role = role;
    }
}

/**
 * Auth request interface (login credentials)
 */
export class AuthRequest {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }
}

/**
 * Auth response interface (token and user info)
 */
export class AuthResponse {
    constructor(token, user) {
        this.token = token;
        this.user = user;
    }
}

/**
 * Full user entity (includes sensitive data like password hash)
 */
export class User {
    constructor(id, email, passwordHash, role, createdAt, updatedAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

/**
 * User creation request interface
 */
export class CreateUserRequest {
    constructor(email, password, role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }
}

/**
 * User update request interface
 */
export class UpdateUserRequest {
    constructor(email, password, role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }
}

/**
 * JWT token payload interface
 */
export class TokenPayload {
    constructor(id, email, role, iat, exp) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.iat = iat;
        this.exp = exp;
    }
}

/**
 * Role check result interface
 */
export class RoleCheckResult {
    constructor(allowed, message) {
        this.allowed = allowed;
        this.message = message;
    }
}

export default {
    UserRole,
    UserSummary,
    AuthRequest,
    AuthResponse,
    User,
    CreateUserRequest,
    UpdateUserRequest,
    TokenPayload,
    RoleCheckResult
};
