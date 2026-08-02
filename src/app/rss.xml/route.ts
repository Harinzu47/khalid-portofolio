import { FeedGenerator } from '@/features/publishing';

export const dynamic = 'force-static';

export async function GET() {
  const rssXml = FeedGenerator.generateRss2();

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
