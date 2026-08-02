import { ContentNode } from './types';

export interface TaxonomySummary {
  tags: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  domains: { name: string; count: number }[];
  series: { name: string; count: number }[];
}

/**
 * Enterprise Taxonomy Aggregator Engine
 */
export function buildTaxonomySummary(nodes: ContentNode[]): TaxonomySummary {
  const tagCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const domainCounts = new Map<string, number>();
  const seriesCounts = new Map<string, number>();

  nodes.forEach((node) => {
    // 1. Tags
    node.taxonomy.tags.forEach((tag) => {
      const normalized = tag.toLowerCase();
      tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
    });

    // 2. Categories
    node.taxonomy.categories.forEach((cat) => {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });

    // 3. Domain
    if (node.taxonomy.domain) {
      domainCounts.set(node.taxonomy.domain, (domainCounts.get(node.taxonomy.domain) || 0) + 1);
    }

    // 4. Series
    if (node.taxonomy.series) {
      seriesCounts.set(node.taxonomy.series, (seriesCounts.get(node.taxonomy.series) || 0) + 1);
    }
  });

  const toSortedArray = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    tags: toSortedArray(tagCounts),
    categories: toSortedArray(categoryCounts),
    domains: toSortedArray(domainCounts),
    series: toSortedArray(seriesCounts),
  };
}
