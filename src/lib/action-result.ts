import { AppError, type AppErrorCode } from './errors';

/**
 * Standardized ActionResult envelope for all Server Actions and UI mutation boundaries.
 * In accordance with HZCODE API & Data Contract v1.
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: AppErrorCode;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Creates a successful ActionResult envelope.
 */
export function actionOk<T>(data?: T): ActionResult<T> {
  return {
    success: true,
    data,
  };
}

export const actionSuccess = actionOk;

/**
 * Creates a failed ActionResult envelope with an optional error code.
 */
export function actionErr(
  error: string,
  code: AppErrorCode = 'INTERNAL_ERROR',
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return {
    success: false,
    error,
    code,
    fieldErrors,
  };
}

export const actionFailure = actionErr;

/**
 * Creates a failed ActionResult envelope containing field-level validation errors.
 */
export function actionFieldErr(
  fieldErrors: Record<string, string[]>,
  message = 'Please correct the validation errors below.'
): ActionResult<never> {
  return {
    success: false,
    error: message,
    code: 'VALIDATION_ERROR',
    fieldErrors,
  };
}

/**
 * Safely converts an unexpected caught error into a standardized ActionResult envelope
 * without leaking raw internal exception details.
 */
export function fromError(err: unknown): ActionResult<never> {
  if (err instanceof AppError) {
    return {
      success: false,
      error: err.message,
      code: err.code,
    };
  }

  if (err instanceof Error) {
    return {
      success: false,
      error: err.message,
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    success: false,
    error: 'An unexpected application error occurred.',
    code: 'INTERNAL_ERROR',
  };
}
