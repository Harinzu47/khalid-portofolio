import { knowledgeGraph } from '../knowledge/knowledgeGraph';
import { buildTaxonomySummary } from '../knowledge/taxonomy';
import { RecommendationResult } from './types';

/**
 * Enterprise Recommendation & Discovery Engine
 */
export class RecommendationEngine {
  /**
   * Recommends top featured or related nodes based on graph connectivity
   */
  public static getRecommendations(limit = 4): RecommendationResult[] {
    const nodes = knowledgeGraph.getAllNodes().filter((n) => !n.draft);
    const featured = nodes.filter((n) => n.featured);
    const targetNodes = featured.length >= limit ? featured : nodes;

    return targetNodes.slice(0, limit).map((n) => ({
      nodeId: n.id,
      title: n.title,
      slug: n.slug,
      type: n.type,
      score: n.featured ? 100 : 50,
      reason: n.featured ? 'Featured Knowledge Node' : `Popular ${n.type} in ${n.taxonomy.domain}`,
    }));
  }

  /**
   * Retrieves top popular taxonomy topics across the platform
   */
  public static getPopularTopics(limit = 6): { name: string; count: number }[] {
    const taxonomy = buildTaxonomySummary(knowledgeGraph.getAllNodes());
    return taxonomy.tags.slice(0, limit);
  }
}
