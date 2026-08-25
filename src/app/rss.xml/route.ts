import { db } from '@/db/client';
import { articles, journalEntries } from '@/db/schema';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hzcode.my.id';
const AUTHOR_NAME = 'Khalid Jundullah';

export async function GET() {
  let feedArticles: { title: string; excerpt?: string | null; slug: string; publishedAt?: Date | null }[] = [];
  let feedJournal: { title: string; summary?: string | null; slug: string; publishedAt?: Date | null; entryDate: string }[] = [];

  try {
    const [pubArticles, pubJournal] = await Promise.all([
      db.query.articles.findMany({
        where: and(
          eq(articles.status, 'published'),
          sql`${articles.publishedAt} IS NOT NULL`,
          isNull(articles.deletedAt)
        ),
        orderBy: [desc(articles.publishedAt)],
        limit: 25,
      }),
      db.query.journalEntries.findMany({
        where: and(
          eq(journalEntries.status, 'published'),
          eq(journalEntries.visibility, 'public'),
          sql`${journalEntries.publishedAt} IS NOT NULL`,
          isNull(journalEntries.deletedAt)
        ),
        orderBy: [desc(journalEntries.publishedAt)],
        limit: 25,
      }),
    ]);

    feedArticles = pubArticles;
    feedJournal = pubJournal;
  } catch (err) {
    console.error('Failed to query DB for RSS feed:', err);
  }

  const items = [
    ...feedArticles.map((a) => ({
      title: a.title,
      description: a.excerpt || '',
      url: `${SITE_URL}/articles/${a.slug}`,
      pubDate: new Date(a.publishedAt || Date.now()).toUTCString(),
      category: 'Technical Publication',
    })),
    ...feedJournal.map((j) => ({
      title: `[Journal] ${j.title}`,
      description: j.summary || `Engineering Log on ${j.entryDate}`,
      url: `${SITE_URL}/journal/${j.slug}`,
      pubDate: new Date(j.publishedAt || Date.now()).toUTCString(),
      category: 'Engineering Journal',
    })),
  ].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const itemsXml = items
    .map(
      (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <author><![CDATA[${AUTHOR_NAME}]]></author>
      <category><![CDATA[${item.category}]]></category>
    </item>`
    )
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[hzcode — Khalid Jundullah]]></title>
    <description><![CDATA[Network & Infrastructure Engineer transitioning to Fullstack Development. Technical articles, cloud architecture, and engineering journal logs.]]></description>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
