import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { PublicSearchService } from '@/services/public-search.service';
import {
  PublicKnowledgeSearchSchema,
  PublicWorkSearchSchema,
} from '@/validations/search';

/**
 * Public Search API Endpoint (Amendment 34).
 * Hard query limits, rate-limited, fail-closed validation.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const limitRes = rateLimit(`search_${ip}`, { limit: 60, windowSeconds: 60 });

  if (!limitRes.success) {
    return NextResponse.json(
      { error: 'Too many search requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After': limitRes.resetSeconds.toString(),
        },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'KNOWLEDGE';
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || undefined;
  const domain = searchParams.get('domain') || undefined;
  const technology = searchParams.get('technology') || undefined;
  const skill = searchParams.get('skill') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
  const sort = (searchParams.get('sort') as any) || 'RELEVANCE';
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
  const pageSize = searchParams.get('pageSize')
    ? Math.min(parseInt(searchParams.get('pageSize')!, 10), 50)
    : 20;

  try {
    if (mode === 'WORK') {
      const parsed = PublicWorkSearchSchema.safeParse({
        q,
        type,
        domain,
        technology,
        skill,
        sort,
        page,
        pageSize,
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid search parameters', details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const results = await PublicSearchService.searchWork(parsed.data);
      return NextResponse.json(results);
    } else {
      const parsed = PublicKnowledgeSearchSchema.safeParse({
        q,
        type,
        domain,
        technology,
        skill,
        tag,
        year,
        sort,
        page,
        pageSize,
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid search parameters', details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const results = await PublicSearchService.searchKnowledge(parsed.data);
      return NextResponse.json(results);
    }
  } catch (err: any) {
    console.error('Public search API error:', err);
    return NextResponse.json(
      { error: 'Internal server error while searching.' },
      { status: 500 }
    );
  }
}
