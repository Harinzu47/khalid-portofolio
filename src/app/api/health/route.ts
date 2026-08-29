import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';
import { logger, generateCorrelationId } from '@/lib/logger';
import { validateAllEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * Public Readiness Probe — /api/health
 *
 * Answers: "Can this application safely receive traffic?"
 *
 * Public Health Minimalism (Phase 11):
 * - Tests critical dependencies (PostgreSQL connection and critical environment presence).
 * - Returns 200 with status: 'ready' when operational.
 * - Returns 503 with status: 'not_ready' when degraded.
 * - MUST NOT expose database names, hosts, table schemas, missing secret names,
 *   Supabase internals, or stack traces to unauthenticated public callers.
 * - Detailed error contexts are sent exclusively to structured server logs.
 */
export async function GET() {
  const correlationId = generateCorrelationId();
  const startTime = Date.now();

  let version = '2.0.0';
  try {
    const pkg = await import('../../../../package.json');
    version = pkg.version || version;
  } catch {
    // package.json may not be resolvable in standalone bundle
  }

  // 1. Check database connectivity
  let dbHealthy = true;
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - dbStart;
    logger.debug('READINESS_DB_PROBE_PASS', { latencyMs: dbLatency }, correlationId);
  } catch (err) {
    dbHealthy = false;
    const errorMessage = err instanceof Error ? err.message : 'Database ping failure';
    logger.error('READINESS_CHECK_FAILED', {
      check: 'database',
      error: errorMessage,
    }, correlationId);
  }

  // 2. Check critical environment variables
  const envReport = validateAllEnv();
  if (!envReport.healthy) {
    logger.error('READINESS_CHECK_FAILED', {
      check: 'environment',
      failedCount: envReport.variables.filter((v) => v.criticality === 'CRITICAL' && v.status !== 'PRESENT').length,
    }, correlationId);
  }

  const isReady = dbHealthy && envReport.healthy;
  const totalResponseTimeMs = Date.now() - startTime;

  const payload = {
    status: isReady ? 'ready' : 'not_ready',
    version,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    checks: [
      { name: 'database', status: dbHealthy ? 'pass' : 'fail' },
      { name: 'environment', status: envReport.healthy ? 'pass' : 'fail' },
    ],
    totalResponseTimeMs,
  };

  return NextResponse.json(payload, {
    status: isReady ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
