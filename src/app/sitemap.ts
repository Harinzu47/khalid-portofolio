import type { MetadataRoute } from 'next';
import { db } from '@/db/client';
import { projects, articles, journalEntries, notes } from '@/db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hzcode.my.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/journal`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/graph`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/roadmap`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/certificates`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/notes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  try {
    const [dbProjects, dbArticles, dbJournal, dbNotes] = await Promise.all([
      db.query.projects.findMany({
        where: isNull(projects.deletedAt),
      }),
      db.query.articles.findMany({
        where: and(
          eq(articles.status, 'published'),
          sql`${articles.publishedAt} IS NOT NULL`,
          isNull(articles.deletedAt)
        ),
      }),
      db.query.journalEntries.findMany({
        where: and(
          eq(journalEntries.status, 'published'),
          eq(journalEntries.visibility, 'public'),
          sql`${journalEntries.publishedAt} IS NOT NULL`,
          isNull(journalEntries.deletedAt)
        ),
      }),
      db.query.notes.findMany({
        where: and(
          eq(notes.status, 'published'),
          isNull(notes.deletedAt)
        ),
      }),
    ]);

    for (const p of dbProjects) {
      entries.push({
        url: `${BASE_URL}/projects/${p.slug}`,
        lastModified: new Date(p.updatedAt || p.createdAt),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }

    for (const a of dbArticles) {
      entries.push({
        url: `${BASE_URL}/articles/${a.slug}`,
        lastModified: new Date(a.updatedAt || a.publishedAt || a.createdAt),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }

    for (const j of dbJournal) {
      entries.push({
        url: `${BASE_URL}/journal/${j.slug}`,
        lastModified: new Date(j.updatedAt || j.publishedAt || j.createdAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    for (const n of dbNotes) {
      entries.push({
        url: `${BASE_URL}/notes/${n.slug}`,
        lastModified: new Date(n.updatedAt || n.createdAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch (err) {
    console.error('Error generating dynamic sitemap from database:', err);
  }

  return entries;
}
