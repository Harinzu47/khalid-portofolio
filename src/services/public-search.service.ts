import { SearchRepositoryService } from './search-repository.service';
import {
  calculateCandidateScore,
  sortRankedCandidates,
  validateCanonicalPublicEligibility,
  SEARCH_ENTITY_REGISTRY,
  type SearchableEntityType,
} from '@/domain/search';
import {
  PublicKnowledgeSearchSchema,
  PublicWorkSearchSchema,
  type PublicKnowledgeSearchInput,
  type PublicWorkSearchInput,
} from '@/validations/search';
import type {
  SearchResultDTO,
  SearchResultItemDTO,
  SearchFacetDTO,
} from '@/types/dtos/search.dto';

export class PublicSearchService {
  /**
   * Public Knowledge Search (/system) (Amendments 5, 6, 7, 20, 31, 33, 41).
   */
  static async searchKnowledge(input: PublicKnowledgeSearchInput): Promise<SearchResultDTO> {
    const parsed = PublicKnowledgeSearchSchema.parse(input);
    const allowedTypes: SearchableEntityType[] = parsed.type
      ? [parsed.type]
      : ['ARTICLE', 'TECH_NOTE', 'ADR', 'JOURNAL_ENTRY'];

    // 1. Retrieve candidates from search_documents
    const rawCandidates = await SearchRepositoryService.searchCandidates({
      query: parsed.q || '',
      scope: 'PUBLIC',
      allowedEntityTypes: allowedTypes,
      filters: {
        domain: parsed.domain,
        technology: parsed.technology,
        skill: parsed.skill,
        tag: parsed.tag,
        year: parsed.year,
      },
      limit: 100, // Fetch candidate buffer for post-validation & facets
    });

    // 2. Score & Rank Candidates
    const rankedCandidates = rawCandidates.map((c) => ({
      ...c,
      score: calculateCandidateScore(c, parsed.q || '', 'KNOWLEDGE'),
    }));
    const sorted = sortRankedCandidates(rankedCandidates, 'KNOWLEDGE');

    // 3. FAIL-CLOSED REVALIDATION against Live Canonical DB (Amendments 5, 6, 7)
    const candidateKeys = sorted.map((c) => ({ entityType: c.entityType, entityId: c.entityId }));
    const validIds = await validateCanonicalPublicEligibility(candidateKeys);

    // Keep only strictly validated items
    const authorizedCandidates = sorted.filter((c) => validIds.has(c.entityId));

    // 4. Compute Facets strictly over authorized candidates (Amendment 20)
    const facets = this.computeKnowledgeFacets(authorizedCandidates);

    // 5. Pagination
    const page = Number(parsed.page) || 1;
    const pageSize = Number(parsed.pageSize) || 20;
    const totalItems = authorizedCandidates.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paginated = authorizedCandidates.slice((page - 1) * pageSize, page * pageSize);

    // 6. Map to Sanitized Public DTO (Amendment 41: zero internal leaks)
    const items: SearchResultItemDTO[] = paginated.map((c) => this.mapToPublicItemDTO(c));

    return {
      query: parsed.q || '',
      mode: 'KNOWLEDGE',
      scope: 'PUBLIC',
      items,
      facets,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * Public Work Search (/work) (Amendments 5, 6, 7, 20, 31, 33, 41).
   */
  static async searchWork(input: PublicWorkSearchInput): Promise<SearchResultDTO> {
    const parsed = PublicWorkSearchSchema.parse(input);
    const allowedTypes: SearchableEntityType[] = parsed.type
      ? [parsed.type]
      : ['PROJECT', 'PROJECT_CASE_STUDY', 'EXPERIENCE'];

    // 1. Retrieve candidates from search_documents
    const rawCandidates = await SearchRepositoryService.searchCandidates({
      query: parsed.q || '',
      scope: 'PUBLIC',
      allowedEntityTypes: allowedTypes,
      filters: {
        domain: parsed.domain,
        technology: parsed.technology,
        skill: parsed.skill,
      },
      limit: 100,
    });

    // 2. Score & Rank Candidates
    const rankedCandidates = rawCandidates.map((c) => ({
      ...c,
      score: calculateCandidateScore(c, parsed.q || '', 'WORK'),
    }));
    const sorted = sortRankedCandidates(rankedCandidates, 'WORK');

    // 3. FAIL-CLOSED REVALIDATION against Live Canonical DB
    const candidateKeys = sorted.map((c) => ({ entityType: c.entityType, entityId: c.entityId }));
    const validIds = await validateCanonicalPublicEligibility(candidateKeys);

    const authorizedCandidates = sorted.filter((c) => validIds.has(c.entityId));

    // 4. Compute Facets over authorized candidates
    const facets = this.computeWorkFacets(authorizedCandidates);

    // 5. Pagination
    const page = Number(parsed.page) || 1;
    const pageSize = Number(parsed.pageSize) || 20;
    const totalItems = authorizedCandidates.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paginated = authorizedCandidates.slice((page - 1) * pageSize, page * pageSize);

    // 6. Map to Sanitized Public DTO
    const items: SearchResultItemDTO[] = paginated.map((c) => this.mapToPublicItemDTO(c));

    return {
      query: parsed.q || '',
      mode: 'WORK',
      scope: 'PUBLIC',
      items,
      facets,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  private static mapToPublicItemDTO(c: any): SearchResultItemDTO {
    const capability = SEARCH_ENTITY_REGISTRY[c.entityType as SearchableEntityType];
    let url: string | null = null;

    if (capability && capability.publicRoutePrefix && c.slug) {
      url = `${capability.publicRoutePrefix}/${c.slug}`;
    }

    return {
      entity: {
        id: c.entityId,
        type: c.entityType,
        title: c.title,
        slug: c.slug,
      },
      description: c.summary,
      url,
      highlights: c.summary ? [c.summary.slice(0, 160)] : [],
      metadata: {
        publishedAt: c.publishedAt ? c.publishedAt.toISOString() : null,
        updatedAt: c.sourceUpdatedAt ? c.sourceUpdatedAt.toISOString() : new Date().toISOString(),
      },
      taxonomy: {
        domains: c.taxonomy?.domains || [],
        technologies: c.taxonomy?.technologies || [],
        skills: c.taxonomy?.skills || [],
        tags: c.taxonomy?.tags || [],
      },
    };
  }

  private static computeKnowledgeFacets(candidates: any[]): SearchFacetDTO[] {
    const typeCounts = new Map<string, number>();
    const domainCounts = new Map<string, number>();
    const techCounts = new Map<string, number>();
    const skillCounts = new Map<string, number>();
    const yearCounts = new Map<string, number>();

    for (const c of candidates) {
      typeCounts.set(c.entityType, (typeCounts.get(c.entityType) || 0) + 1);

      if (c.taxonomy?.domains) {
        for (const d of c.taxonomy.domains) {
          domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
        }
      }
      if (c.taxonomy?.technologies) {
        for (const t of c.taxonomy.technologies) {
          techCounts.set(t, (techCounts.get(t) || 0) + 1);
        }
      }
      if (c.taxonomy?.skills) {
        for (const s of c.taxonomy.skills) {
          skillCounts.set(s, (skillCounts.get(s) || 0) + 1);
        }
      }
      if (c.publishedAt) {
        const year = new Date(c.publishedAt).getFullYear().toString();
        yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
      }
    }

    return [
      {
        field: 'type',
        label: 'Content Type',
        values: Array.from(typeCounts.entries()).map(([value, count]) => ({
          value,
          label: SEARCH_ENTITY_REGISTRY[value as SearchableEntityType]?.label || value,
          count,
        })),
      },
      {
        field: 'technology',
        label: 'Technology',
        values: Array.from(techCounts.entries())
          .map(([value, count]) => ({ value, label: value, count }))
          .slice(0, 15),
      },
      {
        field: 'domain',
        label: 'Domain',
        values: Array.from(domainCounts.entries())
          .map(([value, count]) => ({ value, label: value, count }))
          .slice(0, 10),
      },
      {
        field: 'skill',
        label: 'Skill',
        values: Array.from(skillCounts.entries())
          .map(([value, count]) => ({ value, label: value, count }))
          .slice(0, 10),
      },
      {
        field: 'year',
        label: 'Published Year',
        values: Array.from(yearCounts.entries()).map(([value, count]) => ({
          value,
          label: value,
          count,
        })),
      },
    ];
  }

  private static computeWorkFacets(candidates: any[]): SearchFacetDTO[] {
    const typeCounts = new Map<string, number>();
    const domainCounts = new Map<string, number>();
    const techCounts = new Map<string, number>();

    for (const c of candidates) {
      typeCounts.set(c.entityType, (typeCounts.get(c.entityType) || 0) + 1);

      if (c.taxonomy?.domains) {
        for (const d of c.taxonomy.domains) {
          domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
        }
      }
      if (c.taxonomy?.technologies) {
        for (const t of c.taxonomy.technologies) {
          techCounts.set(t, (techCounts.get(t) || 0) + 1);
        }
      }
    }

    return [
      {
        field: 'type',
        label: 'Project Type',
        values: Array.from(typeCounts.entries()).map(([value, count]) => ({
          value,
          label: SEARCH_ENTITY_REGISTRY[value as SearchableEntityType]?.label || value,
          count,
        })),
      },
      {
        field: 'technology',
        label: 'Technology',
        values: Array.from(techCounts.entries())
          .map(([value, count]) => ({ value, label: value, count }))
          .slice(0, 15),
      },
      {
        field: 'domain',
        label: 'Domain',
        values: Array.from(domainCounts.entries())
          .map(([value, count]) => ({ value, label: value, count }))
          .slice(0, 10),
      },
    ];
  }
}
