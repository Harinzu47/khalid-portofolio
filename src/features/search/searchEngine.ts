import { knowledgeGraph } from '../knowledge/knowledgeGraph';
import { SearchQueryOptions, SearchResultItem } from './types';

/**
 * Enterprise Static In-Memory Search Engine
 */
export class SearchEngine {
  /**
   * Executes tokenized fuzzy search query against the Knowledge Graph search dataset
   */
  public static search(options: SearchQueryOptions): SearchResultItem[] {
    const { query, types, tags, skills, technologies, limit = 10, sortBy = 'relevance' } = options;
    const searchDataset = knowledgeGraph.getIndexStore().generateNormalizedSearchDataset();

    const normalizedQuery = query.trim().toLowerCase();
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    if (queryTokens.length === 0 && !types?.length && !tags?.length && !skills?.length && !technologies?.length) {
      return [];
    }

    const results: SearchResultItem[] = [];

    searchDataset.forEach((item) => {
      // 1. Filter by content type
      if (types && types.length > 0 && !types.includes(item.type)) {
        return;
      }

      // 2. Filter by tag
      if (tags && tags.length > 0) {
        const itemTagsLower = item.tags.map((t) => t.toLowerCase());
        const hasTag = tags.some((t) => itemTagsLower.includes(t.toLowerCase()));
        if (!hasTag) return;
      }

      // 3. Filter by skill
      if (skills && skills.length > 0) {
        const itemSkillsLower = item.skills.map((s) => s.toLowerCase());
        const hasSkill = skills.some((s) => itemSkillsLower.includes(s.toLowerCase()));
        if (!hasSkill) return;
      }

      // 4. Filter by technology
      if (technologies && technologies.length > 0) {
        const itemTechLower = item.technologies.map((t) => t.toLowerCase());
        const hasTech = technologies.some((t) => itemTechLower.includes(t.toLowerCase()));
        if (!hasTech) return;
      }

      // If no query string, include item with base score
      if (queryTokens.length === 0) {
        results.push({
          id: item.id,
          slug: item.slug,
          type: item.type,
          title: item.title,
          description: item.description,
          snippet: item.contentSnippet,
          score: 1,
          tags: item.tags,
          skills: item.skills,
          technologies: item.technologies,
          publishedAt: item.publishedAt,
        });
        return;
      }

      // Score matching tokens
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const descLower = item.description.toLowerCase();
      const snippetLower = item.contentSnippet.toLowerCase();

      queryTokens.forEach((token) => {
        // Exact title match (+30 pts)
        if (titleLower.includes(token)) score += 30;

        // Description match (+15 pts)
        if (descLower.includes(token)) score += 15;

        // Tag match (+15 pts)
        item.tags.forEach((t) => {
          if (t.toLowerCase().includes(token)) score += 15;
        });

        // Skill/Tech match (+15 pts)
        item.skills.concat(item.technologies).forEach((st) => {
          if (st.toLowerCase().includes(token)) score += 15;
        });

        // Snippet match (+5 pts)
        if (snippetLower.includes(token)) score += 5;
      });

      if (score > 0) {
        results.push({
          id: item.id,
          slug: item.slug,
          type: item.type,
          title: item.title,
          description: item.description,
          snippet: item.contentSnippet,
          score,
          highlightTitle: this.highlightText(item.title, queryTokens),
          highlightSnippet: this.highlightText(item.contentSnippet, queryTokens),
          tags: item.tags,
          skills: item.skills,
          technologies: item.technologies,
          publishedAt: item.publishedAt,
        });
      }
    });

    // Sort results
    if (sortBy === 'relevance') {
      results.sort((a, b) => b.score - a.score || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else {
      results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    return results.slice(0, limit);
  }

  /**
   * Generates text snippet with highlighted search terms
   */
  private static highlightText(text: string, tokens: string[]): string {
    let highlighted = text;
    tokens.forEach((token) => {
      if (!token) return;
      const regex = new RegExp(`(${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark className="bg-terminal-primary/20 text-terminal-primary font-semibold">$1</mark>');
    });
    return highlighted;
  }
}
