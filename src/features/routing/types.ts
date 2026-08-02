import type { Metadata } from 'next';
import { ContentNode, ContentNodeType } from '../knowledge/types';

export type LayoutType =
  | 'landing'
  | 'collection'
  | 'article'
  | 'project'
  | 'career'
  | 'certificate'
  | 'note'
  | 'page';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface RouteRegistryEntry {
  key: string;
  path: string;
  contentType?: ContentNodeType;
  title: string;
  description: string;
  layout: LayoutType;
  navLabel?: string;
  showInNav?: boolean;
}

export interface PrevNextNavigation {
  prev: { title: string; slug: string; path: string } | null;
  next: { title: string; slug: string; path: string } | null;
}

export interface PageResolutionResult {
  node: ContentNode;
  breadcrumbs: BreadcrumbItem[];
  prevNext: PrevNextNavigation;
  relatedNodes: ContentNode[];
  skills: { id: string; name: string }[];
  technologies: { id: string; name: string }[];
}
