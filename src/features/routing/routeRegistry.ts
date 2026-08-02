import { ContentNodeType } from '../knowledge/types';
import { RouteRegistryEntry } from './types';

/**
 * Enterprise Centralized Route Registry
 * Single Source of Truth for all routes across the Developer OS framework.
 */
export const routeRegistry: Record<string, RouteRegistryEntry> = {
  home: {
    key: 'home',
    path: '/',
    title: 'hzcode — Developer OS & Knowledge Base',
    description: 'Personal Developer Operating System & Knowledge Management System by Khalid Jundullah.',
    layout: 'landing',
    navLabel: '~/home',
    showInNav: true,
  },
  about: {
    key: 'about',
    path: '/about',
    contentType: 'page',
    title: 'About | hzcode',
    description: 'Background, pillars of expertise, and bio of Khalid Jundullah.',
    layout: 'page',
    navLabel: 'about',
    showInNav: true,
  },
  projects: {
    key: 'projects',
    path: '/projects',
    contentType: 'project',
    title: 'Projects | hzcode',
    description: 'Case studies across Infrastructure, Networking, Web Development, and AI.',
    layout: 'collection',
    navLabel: 'projects',
    showInNav: true,
  },
  projectDetail: {
    key: 'projectDetail',
    path: '/projects/[slug]',
    contentType: 'project',
    title: 'Project Case Study',
    description: 'Detailed architecture and implementation breakdown.',
    layout: 'project',
    showInNav: false,
  },
  articles: {
    key: 'articles',
    path: '/articles',
    contentType: 'article',
    title: 'Articles | hzcode',
    description: 'Long-form technical articles and deep dives.',
    layout: 'collection',
    navLabel: 'articles',
    showInNav: true,
  },
  articleDetail: {
    key: 'articleDetail',
    path: '/articles/[slug]',
    contentType: 'article',
    title: 'Technical Article',
    description: 'Technical deep dive article.',
    layout: 'article',
    showInNav: false,
  },
  journal: {
    key: 'journal',
    path: '/journal',
    contentType: 'journal',
    title: 'Journal | hzcode',
    description: 'Engineering logs, ops notes, and daily bug fixes.',
    layout: 'collection',
    navLabel: 'journal',
    showInNav: true,
  },
  journalDetail: {
    key: 'journalDetail',
    path: '/journal/[slug]',
    contentType: 'journal',
    title: 'Journal Entry',
    description: 'Ops log entry.',
    layout: 'article',
    showInNav: false,
  },
  career: {
    key: 'career',
    path: '/career',
    contentType: 'career',
    title: 'Career History | hzcode',
    description: 'Professional experience, roles, and milestones.',
    layout: 'collection',
    navLabel: 'career',
    showInNav: false,
  },
  careerDetail: {
    key: 'careerDetail',
    path: '/career/[slug]',
    contentType: 'career',
    title: 'Career Role',
    description: 'Detailed breakdown of professional role.',
    layout: 'career',
    showInNav: false,
  },
  notes: {
    key: 'notes',
    path: '/notes',
    contentType: 'note',
    title: 'Notes | hzcode',
    description: 'Atomic technical notes and evergreen knowledge base.',
    layout: 'collection',
    navLabel: 'notes',
    showInNav: true,
  },
  noteDetail: {
    key: 'noteDetail',
    path: '/notes/[...slug]',
    contentType: 'note',
    title: 'Technical Note',
    description: 'Atomic technical note.',
    layout: 'note',
    showInNav: false,
  },
  certificates: {
    key: 'certificates',
    path: '/certificates',
    contentType: 'certificate',
    title: 'Certificates | hzcode',
    description: 'Verified professional certifications and credentials.',
    layout: 'collection',
    showInNav: false,
  },
  certificateDetail: {
    key: 'certificateDetail',
    path: '/certificates/[slug]',
    contentType: 'certificate',
    title: 'Certification Credential',
    description: 'Verified credential detail.',
    layout: 'certificate',
    showInNav: false,
  },
  uses: {
    key: 'uses',
    path: '/uses',
    contentType: 'uses',
    title: 'Uses | hzcode',
    description: 'Hardware, software, network gear, and desk setup.',
    layout: 'page',
    showInNav: false,
  },
  now: {
    key: 'now',
    path: '/now',
    contentType: 'now',
    title: 'Now | hzcode',
    description: 'Current focus, active learning, and location updates.',
    layout: 'page',
    showInNav: false,
  },
  resume: {
    key: 'resume',
    path: '/resume',
    contentType: 'resume',
    title: 'Resume | hzcode',
    description: 'Curriculum Vitae and professional qualifications.',
    layout: 'page',
    showInNav: false,
  },
};

export function getRouteByPath(path: string): RouteRegistryEntry | undefined {
  return Object.values(routeRegistry).find((r) => r.path === path);
}

export function getRouteByContentType(type: ContentNodeType, isDetail = false): RouteRegistryEntry | undefined {
  return Object.values(routeRegistry).find(
    (r) => r.contentType === type && (isDetail ? r.path.includes('[slug]') : !r.path.includes('[slug]'))
  );
}

export function getNavigationRoutes(): RouteRegistryEntry[] {
  return Object.values(routeRegistry).filter((r) => r.showInNav);
}
