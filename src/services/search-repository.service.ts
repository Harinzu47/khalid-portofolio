import { db } from '@/db/client';
import { searchDocuments, type SearchDocument, type NewSearchDocument } from '@/db/schema/search';
import { and, eq, sql, inArray, isNull, isNotNull, lte } from 'drizzle-orm';
import {
  type RawSearchCandidate,
  formatPrefixTsQuery,
  isKnownTechnicalToken,
  type SearchableEntityType,
} from '@/domain/search';

export interface CandidateSearchOptions {
  query: string;
  scope: 'PUBLIC' | 'OWNER';
  ownerId?: string;
  allowedEntityTypes?: SearchableEntityType[];
  includeArchived?: boolean;
  filters?: {
    domain?: string;
    technology?: string;
    skill?: string;
    tag?: string;
    year?: number;
  };
  limit?: number;
}

export class SearchRepositoryService {
  /**
   * Multi-channel candidate retrieval: Exact Tech Token + Prefix + PostgreSQL FTS + Trigram Fallback (Amendments 13, 14, 15).
   */
  static async searchCandidates(options: CandidateSearchOptions): Promise<RawSearchCandidate[]> {
    const cleanQuery = options.query.trim();
    const limit = options.limit || 50;
    const now = new Date();

    // 1. Build Scope & Base Filtering Conditions
    const conditions: any[] = [];

    if (options.scope === 'PUBLIC') {
      conditions.push(sql`${searchDocuments.visibility} = 'public'`);
      conditions.push(sql`${searchDocuments.publicationStatus} = 'published'`);
      conditions.push(sql`${searchDocuments.publishedAt} IS NOT NULL AND ${searchDocuments.publishedAt} <= now()`);
      conditions.push(sql`${searchDocuments.archivedAt} IS NULL`);
    } else {
      if (options.ownerId) {
        conditions.push(sql`${searchDocuments.ownerId} = ${options.ownerId}`);
      }
      if (!options.includeArchived) {
        conditions.push(sql`${searchDocuments.archivedAt} IS NULL`);
      }
    }

    if (options.allowedEntityTypes && options.allowedEntityTypes.length > 0) {
      conditions.push(inArray(searchDocuments.entityType, options.allowedEntityTypes));
    }

    if (options.filters) {
      if (options.filters.domain) {
        conditions.push(sql`${searchDocuments.taxonomy}->'domains' ? ${options.filters.domain}`);
      }
      if (options.filters.technology) {
        conditions.push(sql`${searchDocuments.taxonomy}->'technologies' ? ${options.filters.technology}`);
      }
      if (options.filters.skill) {
        conditions.push(sql`${searchDocuments.taxonomy}->'skills' ? ${options.filters.skill}`);
      }
      if (options.filters.tag) {
        conditions.push(sql`${searchDocuments.taxonomy}->'tags' ? ${options.filters.tag}`);
      }
      if (options.filters.year) {
        conditions.push(sql`EXTRACT(YEAR FROM ${searchDocuments.publishedAt}) = ${options.filters.year}`);
      }
    }

    // 2. Empty Query Scenario: browse/filter mode (Amendment 35)
    if (!cleanQuery) {
      const baseWhere = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;
      const rows = await db
        .select()
        .from(searchDocuments)
        .where(baseWhere)
        .orderBy(sql`COALESCE(${searchDocuments.publishedAt}, ${searchDocuments.sourceUpdatedAt}) DESC`)
        .limit(limit);

      return rows.map((r) => SearchRepositoryService.mapToRawCandidate(r, 0, 0, false, false, false));
    }

    const lowerQuery = cleanQuery.toLowerCase();
    const isTechToken = isKnownTechnicalToken(lowerQuery);
    const prefixQuery = formatPrefixTsQuery(cleanQuery);

    const baseWhere = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;

    // 3. Multi-Channel Query Execution
    const candidatesMap = new Map<string, RawSearchCandidate>();

    // Channel 1: Exact technical token match
    if (isTechToken) {
      const exactRows = await db
        .select()
        .from(searchDocuments)
        .where(sql`${baseWhere} AND ${searchDocuments.exactTerms} @> ARRAY[${lowerQuery}]::text[]`)
        .limit(limit);

      for (const r of exactRows) {
        candidatesMap.set(r.id, SearchRepositoryService.mapToRawCandidate(r, 1.0, 1.0, true, false, false));
      }
    }

    // Channel 2 & 3: Prefix & Full-Text Search via tsquery ('simple' configuration explicitly)
    try {
      const ftsRows = await db
        .select({
          doc: searchDocuments,
          rank: sql<number>`ts_rank_cd(${searchDocuments.searchVector}, websearch_to_tsquery('simple', ${cleanQuery}))`,
          prefixMatch: prefixQuery
            ? sql<boolean>`${searchDocuments.searchVector} @@ to_tsquery('simple', ${prefixQuery})`
            : sql<boolean>`FALSE`,
        })
        .from(searchDocuments)
        .where(
          prefixQuery
            ? sql`${baseWhere} AND (${searchDocuments.searchVector} @@ websearch_to_tsquery('simple', ${cleanQuery}) OR ${searchDocuments.searchVector} @@ to_tsquery('simple', ${prefixQuery}))`
            : sql`${baseWhere} AND ${searchDocuments.searchVector} @@ websearch_to_tsquery('simple', ${cleanQuery})`
        )
        .limit(limit);

      for (const { doc, rank, prefixMatch } of ftsRows) {
        const existing = candidatesMap.get(doc.id);
        const cleanTitle = doc.title.toLowerCase().trim();
        const isTitleExact = cleanTitle === lowerQuery;
        const isTitlePrefix = cleanTitle.startsWith(lowerQuery);

        if (existing) {
          existing.ftsRank = Math.max(existing.ftsRank || 0, rank);
          existing.isTitleExactMatch = isTitleExact;
          existing.isTitlePrefixMatch = isTitlePrefix;
        } else {
          candidatesMap.set(
            doc.id,
            SearchRepositoryService.mapToRawCandidate(doc, rank, 0, false, isTitleExact, isTitlePrefix)
          );
        }
      }
    } catch (ftsError) {
      // Fallback gracefully if tsquery parser encounters unusual syntax
      console.warn('FTS tsquery syntax fallback:', ftsError);
    }

    // Channel 4: Trigram Fuzzy Matching on Title (Amendment 15)
    try {
      const trgmRows = await db
        .select({
          doc: searchDocuments,
          similarity: sql<number>`similarity(${searchDocuments.title}, ${cleanQuery})`,
        })
        .from(searchDocuments)
        .where(
          sql`${baseWhere} AND (${searchDocuments.title} ILIKE ${`%${cleanQuery}%`} OR similarity(${searchDocuments.title}, ${cleanQuery}) > 0.2)`
        )
        .limit(limit);

      for (const { doc, similarity } of trgmRows) {
        const existing = candidatesMap.get(doc.id);
        const cleanTitle = doc.title.toLowerCase().trim();
        const isTitleExact = cleanTitle === lowerQuery;
        const isTitlePrefix = cleanTitle.startsWith(lowerQuery);

        if (existing) {
          existing.trigramSimilarity = Math.max(existing.trigramSimilarity || 0, similarity);
          existing.isTitleExactMatch = isTitleExact;
          existing.isTitlePrefixMatch = isTitlePrefix;
        } else {
          candidatesMap.set(
            doc.id,
            SearchRepositoryService.mapToRawCandidate(doc, 0, similarity, false, isTitleExact, isTitlePrefix)
          );
        }
      }
    } catch (trgmError) {
      console.warn('Trigram similarity query error:', trgmError);
    }

    return Array.from(candidatesMap.values());
  }

  /**
   * Upserts a search document projection (Amendment 46).
   */
  static async upsertDocument(doc: NewSearchDocument): Promise<void> {
    // Generate tsvector in SQL using explicit 'simple' configuration
    const titleText = doc.title || '';
    const summaryText = doc.summary || '';
    const bodyText = doc.bodyText || '';
    const taxonomyArray = doc.taxonomy
      ? [
          ...(doc.taxonomy.domains || []),
          ...(doc.taxonomy.technologies || []),
          ...(doc.taxonomy.skills || []),
          ...(doc.taxonomy.tags || []),
        ].join(' ')
      : '';

    await db
      .insert(searchDocuments)
      .values({
        ...doc,
        searchVector: sql`
          setweight(to_tsvector('simple', ${titleText}), 'A') ||
          setweight(to_tsvector('simple', ${taxonomyArray}), 'B') ||
          setweight(to_tsvector('simple', ${summaryText}), 'B') ||
          setweight(to_tsvector('simple', ${bodyText}), 'C')
        ` as any,
      })
      .onConflictDoUpdate({
        target: [searchDocuments.ownerId, searchDocuments.entityType, searchDocuments.entityId],
        set: {
          title: doc.title,
          slug: doc.slug,
          summary: doc.summary,
          bodyText: doc.bodyText,
          visibility: doc.visibility,
          publicationStatus: doc.publicationStatus,
          publishedAt: doc.publishedAt,
          archivedAt: doc.archivedAt,
          sourceUpdatedAt: doc.sourceUpdatedAt,
          indexedAt: new Date(),
          projectionVersion: doc.projectionVersion,
          taxonomy: doc.taxonomy,
          exactTerms: doc.exactTerms,
          searchVector: sql`
            setweight(to_tsvector('simple', ${titleText}), 'A') ||
            setweight(to_tsvector('simple', ${taxonomyArray}), 'B') ||
            setweight(to_tsvector('simple', ${summaryText}), 'B') ||
            setweight(to_tsvector('simple', ${bodyText}), 'C')
          ` as any,
        },
      });
  }

  /**
   * Deletes a search document projection by owner, entityType, and entityId.
   */
  static async deleteDocument(
    ownerId: string,
    entityType: SearchableEntityType,
    entityId: string
  ): Promise<void> {
    await db
      .delete(searchDocuments)
      .where(
        and(
          eq(searchDocuments.ownerId, ownerId),
          eq(searchDocuments.entityType, entityType),
          eq(searchDocuments.entityId, entityId)
        )
      );
  }

  private static mapToRawCandidate(
    doc: SearchDocument,
    ftsRank = 0,
    trigramSimilarity = 0,
    isExactTermMatch = false,
    isTitleExactMatch = false,
    isTitlePrefixMatch = false
  ): RawSearchCandidate {
    return {
      id: doc.id,
      ownerId: doc.ownerId,
      entityType: doc.entityType as SearchableEntityType,
      entityId: doc.entityId,
      title: doc.title,
      slug: doc.slug,
      summary: doc.summary,
      bodyText: doc.bodyText,
      visibility: doc.visibility,
      publicationStatus: doc.publicationStatus,
      publishedAt: doc.publishedAt,
      archivedAt: doc.archivedAt,
      sourceUpdatedAt: doc.sourceUpdatedAt,
      indexedAt: doc.indexedAt,
      taxonomy: doc.taxonomy,
      exactTerms: doc.exactTerms,
      ftsRank,
      trigramSimilarity,
      isExactTermMatch,
      isTitleExactMatch,
      isTitlePrefixMatch,
    };
  }
}
