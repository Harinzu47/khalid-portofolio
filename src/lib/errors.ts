/**
 * Canonical Application Domain Error Codes per HZCODE API & Data Contract v1
 */
export type AppErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'PUBLISH_VALIDATION_FAILED'
  | 'PUBLICATION_BLOCKED'
  | 'RELATIONSHIP_INVALID'
  | 'RELATIONSHIP_DUPLICATE'
  | 'RELATIONSHIP_INCOMPATIBLE'
  | 'MEDIA_INVALID'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'DATABASE_ERROR'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'; // Backwards-compatibility alias

/**
 * Standardized Application Domain Error Base Class
 */
export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly statusCode: number;

  constructor(message: string, code: AppErrorCode = 'INTERNAL_ERROR', statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.fieldErrors = fieldErrors;
  }
}

export class AuthRequiredError extends AppError {
  constructor(message = 'Authentication required.') {
    super(message, 'AUTH_REQUIRED', 401);
  }
}

/** Backward compatibility alias for AuthRequiredError */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required.') {
    super(message, 'AUTH_REQUIRED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, identifier?: string) {
    const detail = identifier ? ` with identifier "${identifier}"` : '';
    super(`${entity}${detail} was not found.`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class PublishValidationError extends AppError {
  constructor(message: string) {
    super(message, 'PUBLISH_VALIDATION_FAILED', 422);
  }
}

export class RelationshipInvalidError extends AppError {
  constructor(message: string) {
    super(message, 'RELATIONSHIP_INVALID', 422);
  }
}

export class RelationshipDuplicateError extends AppError {
  constructor(message = 'An active relationship with the same source, target, and relationship type already exists.') {
    super(message, 'RELATIONSHIP_DUPLICATE', 409);
  }
}

export class RelationshipIncompatibleError extends AppError {
  constructor(message = 'The specified relationship type is not compatible with the source and target entity types.') {
    super(message, 'RELATIONSHIP_INCOMPATIBLE', 422);
  }
}

export class MediaInvalidError extends AppError {
  constructor(message: string) {
    super(message, 'MEDIA_INVALID', 422);
  }
}

export class RateLimitedError extends AppError {
  public readonly resetSeconds?: number;

  constructor(message = 'Rate limit exceeded.', resetSeconds?: number) {
    super(message, 'RATE_LIMITED', 429);
    this.resetSeconds = resetSeconds;
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'A database persistence error occurred.') {
    super(message, 'DATABASE_ERROR', 500);
  }
}
