import { db } from '@/db/client';
import { relationshipTypes, relationshipTypeCompatibility } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { SearchRepositoryService } from './search-repository.service';
import {
  calculateCandidateScore,
  sortRankedCandidates,
  SEARCH_ENTITY_REGISTRY,
  searchStaticCommands,
  type SearchableEntityType,
} from '@/domain/search';

import {
  OwnerGlobalSearchSchema,
  CommandPaletteSearchSchema,
  EntityPickerSearchSchema,
  type OwnerGlobalSearchInput,
  type CommandPaletteSearchInput,
  type EntityPickerSearchInput,
} from '@/validations/search';
import type {
  SearchResultDTO,
  SearchResultItemDTO,
  CommandPaletteItemDTO,
  SearchFacetDTO,
} from '@/types/dtos/search.dto';

export interface RelationshipTargetSearchInput {
  sourceType: string;
  sourceId: string;
  relationshipTypeCode: string;
  query?: string;
  limit?: number;
}

export class OwnerSearchService {
  /**
   * Owner Global Corpus Search (CMD+K / Admin Search) (Amendments 3, 20, 37, 42).
   */
  static async global(
    ownerId: string,
    input: OwnerGlobalSearchInput
  ): Promise<SearchResultDTO> {
    const parsed = OwnerGlobalSearchSchema.parse(input);
    const rawCandidates = await SearchRepositoryService.searchCandidates({
      query: parsed.query || '',
      scope: 'OWNER',
      ownerId,
      allowedEntityTypes: parsed.entityTypes,
      includeArchived: parsed.includeArchived,
      limit: parsed.limit,
    });

    const rankedCandidates = rawCandidates.map((c) => ({
      ...c,
      score: calculateCandidateScore(c, parsed.query || '', 'GLOBAL'),
    }));
    const sorted = sortRankedCandidates(rankedCandidates, 'GLOBAL');

    const facets = this.computeOwnerFacets(sorted);
    const items: SearchResultItemDTO[] = sorted.map((c) => this.mapToOwnerItemDTO(c));

    return {
      query: parsed.query || '',
      mode: 'GLOBAL',
      scope: 'OWNER',
      items,
      facets,
      pagination: {
        page: 1,
        pageSize: parsed.limit,
        totalItems: sorted.length,
        totalPages: 1,
      },
    };
  }

  /**
   * Command Palette Search (Amendments 29, 30).
   * Combines static authorized commands with top matching entity records.
   */
  static async commandPalette(
    ownerId: string,
    input: CommandPaletteSearchInput
  ): Promise<CommandPaletteItemDTO[]> {
    const parsed = CommandPaletteSearchSchema.parse(input);
    const results: CommandPaletteItemDTO[] = [];
    const limit = parsed.limit;

    // 1. Static Command matches
    const matchedCommands = searchStaticCommands(parsed.query || '');
    for (const cmd of matchedCommands.slice(0, 6)) {
      results.push({
        kind: 'COMMAND',
        id: cmd.id,
        title: cmd.label,
        subtitle: cmd.description,
        href: cmd.href,
        category: cmd.category,
        shortcut: cmd.shortcut,
      });
    }

    // 2. Top Entity matches from owner corpus
    if (parsed.query && parsed.query.trim().length > 0) {
      const rawCandidates = await SearchRepositoryService.searchCandidates({
        query: parsed.query,
        scope: 'OWNER',
        ownerId,
        includeArchived: false,
        limit: 8,
      });

      const ranked = rawCandidates.map((c) => ({
        ...c,
        score: calculateCandidateScore(c, parsed.query, 'GLOBAL'),
      }));
      const sorted = sortRankedCandidates(ranked, 'GLOBAL');

      for (const item of sorted.slice(0, 6)) {
        results.push({
          kind: 'ENTITY',
          id: item.entityId,
          title: item.title,
          subtitle: `${SEARCH_ENTITY_REGISTRY[item.entityType]?.label || item.entityType} • ${item.publicationStatus || item.visibility}`,
          href: this.resolveAdminEditRoute(item.entityType, item.entityId),
          entityType: item.entityType,
        });
      }
    }

    return results.slice(0, limit);
  }

  /**
   * Entity Picker Candidate Search (Amendments 26, 28).
   * Type-restricted, prefix-accelerated candidate selectors for entity forms.
   */
  static async entityPicker(
    ownerId: string,
    input: EntityPickerSearchInput
  ): Promise<SearchResultItemDTO[]> {
    const parsed = EntityPickerSearchSchema.parse(input);
    const rawCandidates = await SearchRepositoryService.searchCandidates({
      query: parsed.query || '',
      scope: 'OWNER',
      ownerId,
      allowedEntityTypes: parsed.entityTypes,
      includeArchived: false,
      limit: parsed.limit,
    });

    const ranked = rawCandidates.map((c) => ({
      ...c,
      score: calculateCandidateScore(c, parsed.query || '', 'ENTITY_PICKER'),
    }));
    const sorted = sortRankedCandidates(ranked, 'ENTITY_PICKER');

    return sorted.map((c) => this.mapToOwnerItemDTO(c));
  }

  /**
   * Relationship Target Candidate Search (Amendments 27, 28).
   * Integrates canonical compatibility matrix (Phase 6) and enforces owner isolation.
   */
  static async relationshipTargets(
    ownerId: string,
    input: RelationshipTargetSearchInput
  ): Promise<SearchResultItemDTO[]> {
    // 1. Resolve relationship type record
    const relType = await db.query.relationshipTypes.findFirst({
      where: eq(relationshipTypes.code, input.relationshipTypeCode),
    });

    if (!relType) {
      return [];
    }

    // 2. Query allowed target types from compatibility table
    const compatRows = await db
      .select({ targetType: relationshipTypeCompatibility.targetType })
      .from(relationshipTypeCompatibility)
      .where(
        and(
          eq(relationshipTypeCompatibility.relationshipTypeId, relType.id),
          eq(relationshipTypeCompatibility.sourceType, input.sourceType as any)
        )
      );

    const allowedTargets = compatRows.map((r) => r.targetType as SearchableEntityType);

    if (allowedTargets.length === 0) {
      return [];
    }

    // 2. Query candidates for allowed targets under owner isolation
    const rawCandidates = await SearchRepositoryService.searchCandidates({
      query: input.query || '',
      scope: 'OWNER',
      ownerId,
      allowedEntityTypes: allowedTargets,
      includeArchived: false,
      limit: input.limit || 20,
    });

    // 3. Exclude self-edge target (sourceId == entityId)
    const validCandidates = rawCandidates.filter(
      (c) => !(c.entityType === input.sourceType && c.entityId === input.sourceId)
    );

    const ranked = validCandidates.map((c) => ({
      ...c,
      score: calculateCandidateScore(c, input.query || '', 'RELATIONSHIP_PICKER'),
    }));
    const sorted = sortRankedCandidates(ranked, 'RELATIONSHIP_PICKER');

    return sorted.map((c) => this.mapToOwnerItemDTO(c));
  }

  private static mapToOwnerItemDTO(c: any): SearchResultItemDTO {
    return {
      entity: {
        id: c.entityId,
        type: c.entityType,
        title: c.title,
        slug: c.slug,
      },
      description: c.summary,
      url: this.resolveAdminEditRoute(c.entityType, c.entityId),
      highlights: c.summary ? [c.summary.slice(0, 160)] : [],
      metadata: {
        publicationStatus: c.publicationStatus,
        visibility: c.visibility,
        publishedAt: c.publishedAt ? c.publishedAt.toISOString() : null,
        updatedAt: c.sourceUpdatedAt ? c.sourceUpdatedAt.toISOString() : new Date().toISOString(),
        isArchived: c.archivedAt !== null,
      },
      taxonomy: {
        domains: c.taxonomy?.domains || [],
        technologies: c.taxonomy?.technologies || [],
        skills: c.taxonomy?.skills || [],
        tags: c.taxonomy?.tags || [],
      },
    };
  }

  private static resolveAdminEditRoute(
    entityType: SearchableEntityType,
    entityId: string
  ): string {
    switch (entityType) {
      case 'ARTICLE':
        return `/admin/articles/${entityId}/edit`;
      case 'TECH_NOTE':
        return `/admin/notes/${entityId}/edit`;
      case 'ADR':
        return `/admin/adrs/${entityId}/edit`;
      case 'JOURNAL_ENTRY':
        return `/admin/journal/${entityId}/edit`;
      case 'PROJECT':
        return `/admin/projects/${entityId}/edit`;
      case 'PROJECT_CASE_STUDY':
        return `/admin/projects`;
      case 'EXPERIENCE':
        return `/admin/career/${entityId}/edit`;
      case 'LEARNING_PATH':
        return `/admin/learning/paths/${entityId}/edit`;
      case 'ROADMAP':
        return `/admin/roadmap/${entityId}/edit`;
      case 'CERTIFICATE':
        return `/admin/certificates/${entityId}/edit`;
      case 'SKILL':
        return `/admin/skills/${entityId}/edit`;
      case 'DOMAIN':
        return `/admin/domains/${entityId}/edit`;
      case 'TECHNOLOGY':
        return `/admin/technologies/${entityId}/edit`;
      case 'NOW_ENTRY':
        return `/admin/now/${entityId}/edit`;
      case 'MEDIA':
        return `/admin/media`;
      default:
        return `/admin`;
    }
  }

  private static computeOwnerFacets(candidates: any[]): SearchFacetDTO[] {
    const typeCounts = new Map<string, number>();
    const visibilityCounts = new Map<string, number>();
    const statusCounts = new Map<string, number>();

    for (const c of candidates) {
      typeCounts.set(c.entityType, (typeCounts.get(c.entityType) || 0) + 1);
      visibilityCounts.set(c.visibility, (visibilityCounts.get(c.visibility) || 0) + 1);
      if (c.publicationStatus) {
        statusCounts.set(c.publicationStatus, (statusCounts.get(c.publicationStatus) || 0) + 1);
      }
    }

    return [
      {
        field: 'type',
        label: 'Entity Type',
        values: Array.from(typeCounts.entries()).map(([value, count]) => ({
          value,
          label: SEARCH_ENTITY_REGISTRY[value as SearchableEntityType]?.label || value,
          count,
        })),
      },
      {
        field: 'visibility',
        label: 'Visibility',
        values: Array.from(visibilityCounts.entries()).map(([value, count]) => ({
          value,
          label: value,
          count,
        })),
      },
      {
        field: 'status',
        label: 'Publication Status',
        values: Array.from(statusCounts.entries()).map(([value, count]) => ({
          value,
          label: value,
          count,
        })),
      },
    ];
  }
}
