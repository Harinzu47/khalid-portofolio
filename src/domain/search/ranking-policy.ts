import { SEARCH_ENTITY_REGISTRY, type SearchableEntityType } from './search-entity-registry';
import type { SearchMode } from './search-types';

export interface RawSearchCandidate {
  id: string;
  ownerId: string;
  entityType: SearchableEntityType;
  entityId: string;
  title: string;
  slug: string | null;
  summary: string | null;
  bodyText: string | null;
  visibility: string;
  publicationStatus: string | null;
  publishedAt: Date | null;
  archivedAt: Date | null;
  sourceUpdatedAt: Date;
  indexedAt: Date;
  taxonomy: {
    domains: string[];
    technologies: string[];
    skills: string[];
    tags: string[];
  } | null;
  exactTerms: string[] | null;
  ftsRank?: number;
  trigramSimilarity?: number;
  isExactTermMatch?: boolean;
  isTitleExactMatch?: boolean;
  isTitlePrefixMatch?: boolean;
}

export interface RankedSearchCandidate extends RawSearchCandidate {
  score: number;
}

/**
 * Calculates a deterministic relevance score for a search candidate (Amendments 16, 17).
 */
export function calculateCandidateScore(
  candidate: RawSearchCandidate,
  query: string,
  mode: SearchMode
): number {
  let score = 0;
  const cleanQuery = query.toLowerCase().trim();

  // 1. Channel 1: Exact Technical Token Match (+100)
  if (candidate.isExactTermMatch || (candidate.exactTerms && candidate.exactTerms.includes(cleanQuery))) {
    score += 100;
  }

  // 2. Channel 2: Title Exact / Prefix Match (+80 / +40)
  const cleanTitle = candidate.title.toLowerCase().trim();
  if (cleanTitle === cleanQuery) {
    score += 80;
  } else if (cleanTitle.startsWith(cleanQuery)) {
    score += 40;
  }

  // 3. Channel 3: PostgreSQL Full-Text Rank (ts_rank_cd: 0 - 1 scaled to 50)
  if (candidate.ftsRank && candidate.ftsRank > 0) {
    score += Math.min(candidate.ftsRank * 50, 50);
  }

  // 4. Channel 4: Trigram Similarity (0 - 1 scaled to 30)
  if (candidate.trigramSimilarity && candidate.trigramSimilarity > 0) {
    score += candidate.trigramSimilarity * 30;
  }

  // 5. Mode Priority Boost (e.g. Knowledge mode favors Tech Notes/Articles; Work favors Projects)
  const capability = SEARCH_ENTITY_REGISTRY[candidate.entityType];
  const modePriority = capability ? capability.modePriority[mode] || 0 : 0;
  score += modePriority * 0.2; // Max ~20 points from mode priority

  return score;
}

/**
 * Deterministically sorts search candidates with stable tie-breakers (Amendment 16).
 * Tie-breakers: score DESC -> modePriority DESC -> temporal date DESC -> entityType -> entityId
 */
export function sortRankedCandidates(
  candidates: RankedSearchCandidate[],
  mode: SearchMode
): RankedSearchCandidate[] {
  return [...candidates].sort((a, b) => {
    // 1. Primary: Score DESC
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // 2. Secondary: Mode Priority DESC
    const prioA = SEARCH_ENTITY_REGISTRY[a.entityType]?.modePriority[mode] || 0;
    const prioB = SEARCH_ENTITY_REGISTRY[b.entityType]?.modePriority[mode] || 0;
    if (prioB !== prioA) {
      return prioB - prioA;
    }

    // 3. Tertiary: Published / Updated Date DESC
    const dateA = a.publishedAt ? a.publishedAt.getTime() : a.sourceUpdatedAt.getTime();
    const dateB = b.publishedAt ? b.publishedAt.getTime() : b.sourceUpdatedAt.getTime();
    if (dateB !== dateA) {
      return dateB - dateA;
    }

    // 4. Quaternary: Entity Type ASC
    if (a.entityType !== b.entityType) {
      return a.entityType.localeCompare(b.entityType);
    }

    // 5. Final Deterministic Tie-Breaker: Entity ID ASC
    return a.entityId.localeCompare(b.entityId);
  });
}
