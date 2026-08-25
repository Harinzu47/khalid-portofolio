import { db } from '@/db/client';
import {
  projects,
  articles,
  journalEntries,
  notes,
  skills,
  roadmapItems,
} from '@/db/schema';
import { ilike, or, and, eq, isNull, sql } from 'drizzle-orm';

export interface SearchResultItem {
  id: string;
  category: 'projects' | 'articles' | 'journal' | 'notes' | 'skills' | 'roadmap';
  title: string;
  description?: string | null;
  href: string;
}

export class SearchService {
  /**
   * Performs unified search across projects, articles, journal logs, notes, skills, and roadmap.
   * STRICT SECURITY: Only searches public, published, non-deleted records.
   */
  static async search(query: string, limit = 20): Promise<SearchResultItem[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const searchPattern = `%${cleanQuery}%`;

    const [
      matchedProjects,
      matchedArticles,
      matchedJournal,
      matchedNotes,
      matchedSkills,
      matchedRoadmap,
    ] = await Promise.all([
      // 1. Projects
      db.query.projects.findMany({
        where: and(
          or(
            ilike(projects.title, searchPattern),
            ilike(projects.shortDescription, searchPattern),
            ilike(projects.description, searchPattern)
          ),
          isNull(projects.deletedAt)
        ),
        limit: 5,
      }),

      // 2. Articles
      db.query.articles.findMany({
        where: and(
          or(
            ilike(articles.title, searchPattern),
            ilike(articles.excerpt, searchPattern),
            ilike(articles.content, searchPattern)
          ),
          eq(articles.status, 'published'),
          sql`${articles.publishedAt} IS NOT NULL`,
          isNull(articles.deletedAt)
        ),
        limit: 5,
      }),

      // 3. Journal (Public only!)
      db.query.journalEntries.findMany({
        where: and(
          or(
            ilike(journalEntries.title, searchPattern),
            ilike(journalEntries.summary, searchPattern),
            ilike(journalEntries.content, searchPattern)
          ),
          eq(journalEntries.status, 'published'),
          eq(journalEntries.visibility, 'public'),
          sql`${journalEntries.publishedAt} IS NOT NULL`,
          isNull(journalEntries.deletedAt)
        ),
        limit: 5,
      }),

      // 4. Notes
      db.query.notes.findMany({
        where: and(
          or(
            ilike(notes.title, searchPattern),
            ilike(notes.content, searchPattern)
          ),
          eq(notes.status, 'published'),
          isNull(notes.deletedAt)
        ),
        limit: 5,
      }),

      // 5. Skills
      db.query.skills.findMany({
        where: or(
          ilike(skills.name, searchPattern),
          ilike(skills.category, searchPattern),
          ilike(skills.description, searchPattern)
        ),
        limit: 5,
      }),

      // 6. Roadmap
      db.query.roadmapItems.findMany({
        where: or(
          ilike(roadmapItems.title, searchPattern),
          ilike(roadmapItems.category, searchPattern),
          ilike(roadmapItems.description, searchPattern)
        ),
        limit: 5,
      }),
    ]);

    const results: SearchResultItem[] = [];

    // Format Projects
    for (const p of matchedProjects) {
      results.push({
        id: p.id,
        category: 'projects',
        title: p.title,
        description: p.shortDescription || p.description?.slice(0, 120),
        href: `/projects/${p.slug}`,
      });
    }

    // Format Articles
    for (const a of matchedArticles) {
      results.push({
        id: a.id,
        category: 'articles',
        title: a.title,
        description: a.excerpt || a.content?.slice(0, 120),
        href: `/articles/${a.slug}`,
      });
    }

    // Format Journal
    for (const j of matchedJournal) {
      results.push({
        id: j.id,
        category: 'journal',
        title: j.title,
        description: j.summary || j.content?.slice(0, 120),
        href: `/journal/${j.slug}`,
      });
    }

    // Format Notes
    for (const n of matchedNotes) {
      results.push({
        id: n.id,
        category: 'notes',
        title: n.title,
        description: n.content?.slice(0, 120),
        href: `/notes/${n.slug}`,
      });
    }

    // Format Skills
    for (const s of matchedSkills) {
      results.push({
        id: s.id,
        category: 'skills',
        title: s.name,
        description: `${s.category} • ${s.description || 'Core competency'}`,
        href: `/`,
      });
    }

    // Format Roadmap
    for (const r of matchedRoadmap) {
      results.push({
        id: r.id,
        category: 'roadmap',
        title: r.title,
        description: `${r.category || 'General'} • Status: ${r.status}`,
        href: `/roadmap`,
      });
    }

    return results.slice(0, limit);
  }
}
