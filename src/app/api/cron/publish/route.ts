import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PublishingSchedulerService } from '@/services/publishing-scheduler.service';

/**
 * Scheduled Publishing Cron Execution Endpoint (Amendments 18, 19, 20).
 * Triggered by scheduled cron workers (e.g. Vercel Cron, GitHub Actions, external worker).
 */
export async function POST(req: NextRequest) {
  try {
    const configuredSecret = process.env.CRON_SECRET;
    if (!configuredSecret) {
      return NextResponse.json(
        { error: 'Unauthorized: Cron secret not configured.' },
        { status: 401 }
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.headers.get('x-cron-secret') || '';

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Constant-time comparison to prevent timing attacks (Amendment 19)
    const tokenBuffer = Buffer.from(token);
    const secretBuffer = Buffer.from(configuredSecret);

    if (
      tokenBuffer.length !== secretBuffer.length ||
      !crypto.timingSafeEqual(tokenBuffer, secretBuffer)
    ) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const result = await PublishingSchedulerService.processDuePublications();

    return NextResponse.json({
      success: true,
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      results: result.results,
    });
  } catch {
    // Return sanitized error response without leaking internals (Amendment 21)
    return NextResponse.json(
      { error: 'Internal scheduler error.' },
      { status: 500 }
    );
  }
}
