import { logger } from '@/lib/logger';
import { validateAllEnv } from '@/lib/env';

/**
 * Next.js Instrumentation Hook — Phase 11
 *
 * Runs once at server startup. Performs:
 * 1. Environment validation with critical/optional classification
 * 2. Application boot event logging
 *
 * Does NOT crash on non-critical env issues (warns instead).
 * Crashes only when CRITICAL variables are missing/invalid.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Read version from package.json at boot time
    let version = 'unknown';
    try {
      const pkg = await import('../package.json');
      version = pkg.version || 'unknown';
    } catch {
      // package.json may not be resolvable in all build contexts
    }

    // Run comprehensive environment validation
    const envReport = validateAllEnv();

    // Log each variable status
    for (const v of envReport.variables) {
      if (v.status === 'PRESENT') {
        logger.debug('ENV_VAR_VALIDATED', {
          variable: v.name,
          criticality: v.criticality,
          status: v.status,
        });
      } else if (v.criticality === 'CRITICAL') {
        logger.error('ENV_VAR_MISSING_CRITICAL', {
          variable: v.name,
          criticality: v.criticality,
          status: v.status,
          ...(v.error && { error: v.error }),
        });
      } else if (v.criticality === 'PRIVILEGED') {
        logger.warn('ENV_VAR_DEGRADED', {
          variable: v.name,
          criticality: v.criticality,
          status: v.status,
          ...(v.error && { error: v.error }),
        });
      } else {
        logger.info('ENV_VAR_OPTIONAL_MISSING', {
          variable: v.name,
          criticality: v.criticality,
          status: v.status,
        });
      }
    }

    // Log boot event
    logger.info('APP_STARTED', {
      version,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      runtime: 'nodejs',
      envHealthy: envReport.healthy,
      criticalVars: envReport.variables.filter((v) => v.criticality === 'CRITICAL').length,
      missingOptional: envReport.variables.filter((v) => v.status === 'MISSING' && v.criticality === 'OPTIONAL').length,
    });

    // If critical env vars are missing, log a fatal-level message but do NOT crash.
    if (!envReport.healthy) {
      logger.error('ENV_VALIDATION_FAILED', {
        message: 'Critical environment variables are missing or invalid. Application may not operate correctly.',
        failedVars: envReport.variables
          .filter((v) => v.criticality === 'CRITICAL' && v.status !== 'PRESENT')
          .map((v) => ({ name: v.name, status: v.status, error: v.error })),
      });
    }
  }
}
