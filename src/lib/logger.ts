/**
 * Phase 11: Structured Logging Service
 *
 * Dependency-free, provider-neutral structured logger.
 * Wraps native console methods with JSON output for operational observability.
 *
 * Integration points for future providers (Sentry, Datadog, etc.):
 *   - Replace or extend the `emit()` function
 *   - Hook into error-level events for external error tracking
 *   - Correlation IDs are compatible with OpenTelemetry trace propagation
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  timestamp: string;
  event: string;
  correlationId?: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Minimum log level based on environment.
 * Debug logs are suppressed in production to reduce noise.
 */
function getMinLevel(): LogLevel {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return 'info';
  }
  return 'debug';
}

/**
 * Emits a structured log entry to the appropriate console method.
 * This is the single integration point for external log providers.
 */
function emit(entry: LogEntry): void {
  const minLevel = getMinLevel();
  if (LOG_LEVEL_PRIORITY[entry.level] < LOG_LEVEL_PRIORITY[minLevel]) {
    return;
  }

  const output = JSON.stringify(entry);

  switch (entry.level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'debug':
      console.debug(output);
      break;
    case 'info':
    default:
      console.info(output);
      break;
  }
}

/**
 * Structured logger with canonical event taxonomy.
 *
 * Usage:
 *   logger.info('APP_STARTED', { version: '2.0.0' });
 *   logger.error('HEALTH_CHECK_FAILED', { error: 'DB unreachable' }, correlationId);
 *   logger.warn('ENV_VALIDATION_WARNING', { variable: 'CRON_SECRET', status: 'MISSING' });
 */
export const logger = {
  debug(event: string, meta?: Record<string, unknown>, correlationId?: string): void {
    emit({
      level: 'debug',
      timestamp: new Date().toISOString(),
      event,
      ...(correlationId && { correlationId }),
      ...(meta && { meta }),
    });
  },

  info(event: string, meta?: Record<string, unknown>, correlationId?: string): void {
    emit({
      level: 'info',
      timestamp: new Date().toISOString(),
      event,
      ...(correlationId && { correlationId }),
      ...(meta && { meta }),
    });
  },

  warn(event: string, meta?: Record<string, unknown>, correlationId?: string): void {
    emit({
      level: 'warn',
      timestamp: new Date().toISOString(),
      event,
      ...(correlationId && { correlationId }),
      ...(meta && { meta }),
    });
  },

  error(event: string, meta?: Record<string, unknown>, correlationId?: string): void {
    emit({
      level: 'error',
      timestamp: new Date().toISOString(),
      event,
      ...(correlationId && { correlationId }),
      ...(meta && { meta }),
    });
  },

  /**
   * Logs an event with timing information.
   * Used by performance instrumentation.
   */
  timed(event: string, durationMs: number, meta?: Record<string, unknown>, correlationId?: string): void {
    emit({
      level: 'info',
      timestamp: new Date().toISOString(),
      event,
      durationMs,
      ...(correlationId && { correlationId }),
      ...(meta && { meta }),
    });
  },
};

/**
 * Generates a lightweight correlation ID for request-scoped tracing.
 * Uses crypto.randomUUID() when available, falls back to timestamp-based ID.
 */
export function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
