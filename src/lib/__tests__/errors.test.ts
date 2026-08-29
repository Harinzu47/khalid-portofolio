import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthRequiredError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  PublishValidationError,
  RelationshipInvalidError,
  MediaInvalidError,
  RateLimitedError,
  DatabaseError,
} from '../errors';

describe('AppError Hierarchy', () => {
  it('instantiates base AppError with default internal error code and status 500', () => {
    const err = new AppError('Something went wrong');
    expect(err.message).toBe('Something went wrong');
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.statusCode).toBe(500);
    expect(err instanceof Error).toBe(true);
  });

  it('handles ValidationError with field errors', () => {
    const fieldErrors = { title: ['Title is required'] };
    const err = new ValidationError('Validation failed', fieldErrors);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.statusCode).toBe(400);
    expect(err.fieldErrors).toEqual(fieldErrors);
  });

  it('handles AuthRequiredError and UnauthorizedError alias', () => {
    const err = new AuthRequiredError();
    expect(err.code).toBe('AUTH_REQUIRED');
    expect(err.statusCode).toBe(401);

    const legacyErr = new UnauthorizedError();
    expect(legacyErr.code).toBe('AUTH_REQUIRED');
    expect(legacyErr.statusCode).toBe(401);
  });

  it('handles ForbiddenError', () => {
    const err = new ForbiddenError();
    expect(err.code).toBe('FORBIDDEN');
    expect(err.statusCode).toBe(403);
  });

  it('handles NotFoundError with entity and identifier formatting', () => {
    const err = new NotFoundError('Project', 'proj-123');
    expect(err.message).toBe('Project with identifier "proj-123" was not found.');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.statusCode).toBe(404);
  });

  it('handles ConflictError', () => {
    const err = new ConflictError('Slug already exists');
    expect(err.code).toBe('CONFLICT');
    expect(err.statusCode).toBe(409);
  });

  it('handles PublishValidationError', () => {
    const err = new PublishValidationError('Cannot publish draft without content');
    expect(err.code).toBe('PUBLISH_VALIDATION_FAILED');
    expect(err.statusCode).toBe(422);
  });

  it('handles RelationshipInvalidError', () => {
    const err = new RelationshipInvalidError('Cannot link project to self');
    expect(err.code).toBe('RELATIONSHIP_INVALID');
    expect(err.statusCode).toBe(422);
  });

  it('handles MediaInvalidError', () => {
    const err = new MediaInvalidError('Unsupported file type');
    expect(err.code).toBe('MEDIA_INVALID');
    expect(err.statusCode).toBe(422);
  });

  it('handles RateLimitedError with reset seconds', () => {
    const err = new RateLimitedError('Too many attempts', 45);
    expect(err.code).toBe('RATE_LIMITED');
    expect(err.statusCode).toBe(429);
    expect(err.resetSeconds).toBe(45);
  });

  it('handles DatabaseError', () => {
    const err = new DatabaseError();
    expect(err.code).toBe('DATABASE_ERROR');
    expect(err.statusCode).toBe(500);
  });
});
