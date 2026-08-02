import { ContentNode, ContentNodeType } from '../knowledge/types';

export interface NowModuleData {
  focus: string[];
  learning: string[];
  reading: string[];
  location: string;
  status: string;
  lastUpdated: string;
}

export interface SystemStatistics {
  totalNodes: number;
  articlesCount: number;
  projectsCount: number;
  journalEntriesCount: number;
  notesCount: number;
  technologiesCount: number;
  skillsCount: number;
  totalWordCount: number;
}

export interface LearningTrackProgress {
  id: string;
  title: string;
  domain: string;
  completedSteps: number;
  totalSteps: number;
  percent: number;
}

export interface TechnologyRadarItem {
  id: string;
  name: string;
  category: string;
  usageCount: number;
}

export interface SkillRadarItem {
  id: string;
  name: string;
  category: string;
  level: string;
  nodeCount: number;
}

export interface ActivityFeedItem {
  id: string;
  title: string;
  type: ContentNodeType;
  slug: string;
  date: string;
  description?: string;
}

export interface DashboardState {
  now: NowModuleData;
  statistics: SystemStatistics;
  recentlyPublished: ContentNode[];
  recentArticles: ContentNode[];
  recentJournal: ContentNode[];
  recentProjects: ContentNode[];
  recentNotes: ContentNode[];
  learningProgress: LearningTrackProgress[];
  technologyRadar: TechnologyRadarItem[];
  skillRadar: SkillRadarItem[];
  activityFeed: ActivityFeedItem[];
  pinnedContent: ContentNode[];
  quickNavigation: { title: string; href: string; iconName: string }[];
}
