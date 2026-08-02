import { ContentNode, TimelineItem } from './types';

/**
 * Enterprise Timeline Generator Engine
 * Merges multi-domain content nodes into a unified chronological timeline
 */
export function generateUnifiedTimeline(nodes: ContentNode[]): TimelineItem[] {
  const items: TimelineItem[] = [];

  nodes.forEach((node) => {
    // Only include nodes with valid publication or update dates
    if (!node.publishedAt) return;

    items.push({
      id: node.id,
      title: node.title,
      date: node.publishedAt,
      type: node.type,
      category: node.taxonomy.categories[0] || node.taxonomy.domain,
      description: node.description,
      slug: node.slug,
      skills: node.skills,
      technologies: node.technologies,
    });
  });

  // Sort newest first
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Filter timeline items by year, type, or skill
 */
export function filterTimeline(
  timeline: TimelineItem[],
  filters: { year?: number; type?: string; skillId?: string }
): TimelineItem[] {
  return timeline.filter((item) => {
    if (filters.year) {
      const itemYear = new Date(item.date).getFullYear();
      if (itemYear !== filters.year) return false;
    }
    if (filters.type && item.type !== filters.type) return false;
    if (filters.skillId && !item.skills.includes(filters.skillId)) return false;
    return true;
  });
}
