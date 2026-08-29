import { describe, it, expect } from 'vitest';
import { actionOk, actionErr, actionFieldErr, fromError } from '../action-result';
import { NotFoundError } from '../errors';

describe('ActionResult Envelopes', () => {
  it('creates a successful ActionResult envelope with data', () => {
    const result = actionOk({ id: '123', title: 'Test Project' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: '123', title: 'Test Project' });
    expect(result.error).toBeUndefined();
  });

  it('creates a failed ActionResult envelope with code', () => {
    const result = actionErr('Project not found', 'NOT_FOUND');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Project not found');
    expect(result.code).toBe('NOT_FOUND');
  });

  it('creates a field error envelope with VALIDATION_ERROR code', () => {
    const fieldErrors = { slug: ['Slug must be lowercase'] };
    const result = actionFieldErr(fieldErrors);
    expect(result.success).toBe(false);
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.fieldErrors).toEqual(fieldErrors);
  });

  it('safely converts AppError instances into ActionResult envelopes', () => {
    const appErr = new NotFoundError('Article', 'my-post');
    const result = fromError(appErr);
    expect(result.success).toBe(false);
    expect(result.code).toBe('NOT_FOUND');
    expect(result.error).toContain('my-post');
  });

  it('safely converts standard Error instances into generic error envelopes without crashing', () => {
    const genericErr = new Error('Database connection reset');
    const result = fromError(genericErr);
    expect(result.success).toBe(false);
    expect(result.code).toBe('INTERNAL_ERROR');
    expect(result.error).toBe('Database connection reset');
  });
});
