import { ContentNodeType } from '../knowledge/types';

export interface SearchResultItem {
  id: string;
  slug: string;
  type: ContentNodeType;
  title: string;
  description: string;
  snippet: string;
  score: number;
  highlightTitle?: string;
  highlightSnippet?: string;
  tags: string[];
  skills: string[];
  technologies: string[];
  publishedAt: string;
}

export interface SearchQueryOptions {
  query: string;
  types?: ContentNodeType[];
  tags?: string[];
  skills?: string[];
  technologies?: string[];
  limit?: number;
  sortBy?: 'relevance' | 'date';
}

export interface CommandAction {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Content' | 'Technology' | 'Skill' | 'Quick Action';
  iconName?: string;
  href?: string;
  perform?: () => void;
}

export interface RecommendationResult {
  nodeId: string;
  title: string;
  slug: string;
  type: ContentNodeType;
  score: number;
  reason: string;
}
