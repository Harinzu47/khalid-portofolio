export interface StaticCommandItem {
  id: string;
  label: string;
  category: 'NAVIGATION' | 'CREATION' | 'OPERATIONS';
  href: string;
  shortcut?: string;
  description?: string;
}

export const ADMIN_STATIC_COMMANDS: readonly StaticCommandItem[] = [
  // Creation
  {
    id: 'cmd-create-article',
    label: 'Create New Article',
    category: 'CREATION',
    href: '/admin/articles/new',
    shortcut: 'C A',
    description: 'Draft a new deep-dive technical article',
  },
  {
    id: 'cmd-create-note',
    label: 'Create New Tech Note',
    category: 'CREATION',
    href: '/admin/notes/new',
    shortcut: 'C N',
    description: 'Document an atomic technical pattern or verification',
  },
  {
    id: 'cmd-create-project',
    label: 'Create New Project',
    category: 'CREATION',
    href: '/admin/projects/new',
    shortcut: 'C P',
    description: 'Register a portfolio engineering project',
  },
  {
    id: 'cmd-create-adr',
    label: 'Create New Architecture Decision Record (ADR)',
    category: 'CREATION',
    href: '/admin/adrs/new',
    shortcut: 'C D',
    description: 'Record an architectural decision and context',
  },
  {
    id: 'cmd-create-journal',
    label: 'Create Quick Journal Entry',
    category: 'CREATION',
    href: '/admin/journal/new',
    shortcut: 'C J',
    description: 'Quick-capture a development log or session reflection',
  },
  {
    id: 'cmd-create-roadmap',
    label: 'Create Roadmap Milestone',
    category: 'CREATION',
    href: '/admin/roadmap/new',
    shortcut: 'C R',
    description: 'Define an engineering roadmap objective',
  },
  {
    id: 'cmd-create-certificate',
    label: 'Register New Certificate',
    category: 'CREATION',
    href: '/admin/certificates/new',
    description: 'Add a verified credential with media evidence',
  },

  // Operations & Navigation
  {
    id: 'cmd-nav-publishing',
    label: 'Open Publishing Operations Center',
    category: 'OPERATIONS',
    href: '/admin/publishing',
    shortcut: 'G P',
    description: 'Manage lifecycle, scheduling, and publication readiness',
  },
  {
    id: 'cmd-nav-relationships',
    label: 'Open Knowledge Graph & Relationships',
    category: 'OPERATIONS',
    href: '/admin/relationships',
    shortcut: 'G K',
    description: 'Explore and author cross-entity semantic graph edges',
  },
  {
    id: 'cmd-nav-media',
    label: 'Open Canonical Media Library',
    category: 'OPERATIONS',
    href: '/admin/media',
    shortcut: 'G M',
    description: 'Inspect assets, storage isolation, and orphan diagnostics',
  },
  {
    id: 'cmd-nav-search',
    label: 'Open Search Operations & Diagnostics',
    category: 'OPERATIONS',
    href: '/admin/search',
    shortcut: 'G S',
    description: 'Run idempotent reindexing and check index health',
  },
  {
    id: 'cmd-nav-audit',
    label: 'Open Governance Audit Logs',
    category: 'OPERATIONS',
    href: '/admin/audit-logs',
    shortcut: 'G A',
    description: 'Inspect security and data mutation trails',
  },
] as const;

export function searchStaticCommands(query: string): StaticCommandItem[] {
  const clean = query.toLowerCase().trim();
  if (!clean) return [...ADMIN_STATIC_COMMANDS];

  return ADMIN_STATIC_COMMANDS.filter((cmd) => {
    return (
      cmd.label.toLowerCase().includes(clean) ||
      cmd.category.toLowerCase().includes(clean) ||
      (cmd.description && cmd.description.toLowerCase().includes(clean)) ||
      (cmd.shortcut && cmd.shortcut.toLowerCase().includes(clean))
    );
  });
}
