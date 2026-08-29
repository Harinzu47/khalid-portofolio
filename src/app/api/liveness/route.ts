import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Liveness Probe — /api/liveness
 *
 * Answers: "Is the application process alive?"
 *
 * Lightweight check — no database calls, no expensive dependency checks.
 * Used by container orchestrators (Docker HEALTHCHECK, Kubernetes livenessProbe)
 * and load balancers for process health verification.
 *
 * This endpoint should NOT become unhealthy because an external dependency
 * (database, cache, etc.) is temporarily unavailable.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
