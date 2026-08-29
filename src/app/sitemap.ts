import type { MetadataRoute } from 'next';
import { db } from '@/db/client';
import { projects, articles, notes, adrs, journalEntries } from '@/db/schema';
import { eq, and, isNull, sql, lte } from 'drizzle-orm';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hzcode.my.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/expertise`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/experience`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/system`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/now`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    // 1. Discovery Eligible Projects (Amendments 18, 27)
    const projectRows = await db.query.projects.findMany({
      where: and(
        eq(projects.visibility, 'public'),
        eq(projects.publicationStatus, 'published'),
        lte(projects.publishedAt, sql`now()`),
        isNull(projects.archivedAt)
      ),
      columns: { slug: true, updatedAt: true },
    });

    const projectEntries: MetadataRoute.Sitemap = projectRows.map((p) => ({
      url: `${BASE_URL}/work/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // 2. Discovery Eligible Articles
    const articleRows = await db.query.articles.findMany({
      where: and(
        eq(articles.visibility, 'public'),
        eq(articles.publicationStatus, 'published'),
        lte(articles.publishedAt, sql`now()`),
        isNull(articles.archivedAt)
      ),
      columns: { slug: true, updatedAt: true },
    });

    const articleEntries: MetadataRoute.Sitemap = articleRows.map((a) => ({
      url: `${BASE_URL}/articles/${a.slug}`,
      lastModified: a.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // 3. Discovery Eligible Tech Notes
    const noteRows = await db.query.notes.findMany({
      where: and(
        eq(notes.visibility, 'public'),
        eq(notes.publicationStatus, 'published'),
        lte(notes.publishedAt, sql`now()`),
        isNull(notes.archivedAt)
      ),
      columns: { slug: true, updatedAt: true },
    });

    const noteEntries: MetadataRoute.Sitemap = noteRows.map((n) => ({
      url: `${BASE_URL}/notes/${n.slug}`,
      lastModified: n.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // 4. Discovery Eligible ADRs
    const adrRows = await db.query.adrs.findMany({
      where: and(
        eq(adrs.visibility, 'public'),
        eq(adrs.publicationStatus, 'published'),
        lte(adrs.publishedAt, sql`now()`),
        isNull(adrs.archivedAt)
      ),
      columns: { slug: true, updatedAt: true },
    });

    const adrEntries: MetadataRoute.Sitemap = adrRows.map((ad) => ({
      url: `${BASE_URL}/adrs/${ad.slug}`,
      lastModified: ad.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // 5. Discovery Eligible Journal Entries
    const journalRows = await db.query.journalEntries.findMany({
      where: and(
        eq(journalEntries.visibility, 'public'),
        eq(journalEntries.publicationStatus, 'published'),
        lte(journalEntries.publishedAt, sql`now()`),
        isNull(journalEntries.archivedAt)
      ),
      columns: { slug: true, updatedAt: true },
    });

    const journalEntriesList: MetadataRoute.Sitemap = journalRows.map((j) => ({
      url: `${BASE_URL}/journal/${j.slug}`,
      lastModified: j.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...projectEntries,
      ...articleEntries,
      ...noteEntries,
      ...adrEntries,
      ...journalEntriesList,
    ];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap entries:', error);
    return staticRoutes;
  }
}
