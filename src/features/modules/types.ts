import { ContentNode, ContentNodeType } from '../knowledge/types';

export type DomainModuleKey =
  | 'now'
  | 'uses'
  | 'resume'
  | 'career'
  | 'journal'
  | 'notes'
  | 'projects'
  | 'certificates'
  | 'roadmap'
  | 'books'
  | 'courses'
  | 'talks'
  | 'achievements'
  | 'experiments'
  | 'lab-notes'
  | 'timeline'
  | 'weekly-review'
  | 'monthly-review'
  | 'year-in-review'
  | 'changelog';

export interface DomainModuleConfig {
  key: DomainModuleKey;
  name: string;
  description: string;
  iconName: string;
  targetContentType?: ContentNodeType;
  routePath: string;
}

export interface DomainModuleData {
  config: DomainModuleConfig;
  totalCount: number;
  featuredNodes: ContentNode[];
  recentNodes: ContentNode[];
  allNodes: ContentNode[];
  metadata?: Record<string, unknown>;
}
