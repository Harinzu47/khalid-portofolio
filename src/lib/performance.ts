import { logger } from '@/lib/logger';

/**
 * Phase 11: Server-side performance instrumentation.
 *
 * Wraps async operations with timing measurement.
 * Emits structured log events when operations exceed configurable threshold.
 *
 * IMPORTANT: This is observational only — it does NOT modify query behavior,
 * change return values, or alter business logic.
 *
 * Usage:
 *   const { result, durationMs } = await withTiming('GET_WORK_INDEX', () =>
 *     publicReadModelsService.getWorkIndex()
 *   );
 */

/** Default threshold for slow operation warnings (ms) */
const DEFAULT_SLOW_THRESHOLD_MS = 500;

export interface TimingResult<T> {
  result: T;
  durationMs: number;
}

/**
 * Wraps an async function with timing instrumentation.
 *
 * @param operationName - Canonical event name for the operation
 * @param fn - The async function to measure
 * @param options - Optional configuration
 * @returns The original result plus timing metadata
 */
export async function withTiming<T>(
  operationName: string,
  fn: () => Promise<T>,
  options?: {
    /** Threshold in ms above which a warning is logged. Default: 500ms */
    slowThresholdMs?: number;
    /** Optional correlation ID for request-scoped tracing */
    correlationId?: string;
    /** Optional metadata to include in log events */
    meta?: Record<string, unknown>;
  }
): Promise<TimingResult<T>> {
  const threshold = options?.slowThresholdMs ?? DEFAULT_SLOW_THRESHOLD_MS;
  const start = performance.now();

  const result = await fn();

  const durationMs = Math.round(performance.now() - start);

  if (durationMs > threshold) {
    logger.warn('SLOW_OPERATION', {
      operation: operationName,
      durationMs,
      thresholdMs: threshold,
      ...options?.meta,
    }, options?.correlationId);
  } else {
    logger.debug('OPERATION_TIMED', {
      operation: operationName,
      durationMs,
      ...options?.meta,
    }, options?.correlationId);
  }

  return { result, durationMs };
}

/**
 * Synchronous timing wrapper for non-async operations.
 */
export function withTimingSync<T>(
  operationName: string,
  fn: () => T,
  options?: {
    slowThresholdMs?: number;
    correlationId?: string;
    meta?: Record<string, unknown>;
  }
): TimingResult<T> {
  const threshold = options?.slowThresholdMs ?? DEFAULT_SLOW_THRESHOLD_MS;
  const start = performance.now();

  const result = fn();

  const durationMs = Math.round(performance.now() - start);

  if (durationMs > threshold) {
    logger.warn('SLOW_OPERATION', {
      operation: operationName,
      durationMs,
      thresholdMs: threshold,
      ...options?.meta,
    }, options?.correlationId);
  }

  return { result, durationMs };
}
