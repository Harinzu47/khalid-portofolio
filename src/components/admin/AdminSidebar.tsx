'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  BookOpen,
  StickyNote,
  Briefcase,
  Award,
  Sparkles,
  Cpu,
  Map,
  Target,
  Image as ImageIcon,
  Settings,
  Terminal,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

export interface NavGroup {
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'System Metrics', href: '/admin/metrics', icon: BarChart3 },
    ],
  },
  {
    label: 'Content Engine',
    items: [
      { label: 'Projects', href: '/admin/projects', icon: FolderGit2 },
      { label: 'Articles', href: '/admin/articles', icon: FileText },
      { label: 'Journal Logs', href: '/admin/journal', icon: BookOpen },
      { label: 'Tech Notes', href: '/admin/notes', icon: StickyNote },
    ],
  },
  {
    label: 'Career & Taxonomy',
    items: [
      { label: 'Career', href: '/admin/career', icon: Briefcase },
      { label: 'Certificates', href: '/admin/certificates', icon: Award },
      { label: 'Skills', href: '/admin/skills', icon: Sparkles },
      { label: 'Technologies', href: '/admin/technologies', icon: Cpu },
    ],
  },
  {
    label: 'Planning & Growth',
    items: [
      { label: 'Roadmap', href: '/admin/roadmap', icon: Map },
      { label: 'Learning Goals', href: '/admin/learning-goals', icon: Target },
    ],
  },
  {
    label: 'Media & Security',
    items: [
      { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
      { label: 'Audit Trail', href: '/admin/audit-logs', icon: ShieldCheck },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-terminal-surface border-r border-terminal-border flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-terminal-border bg-terminal-bg">
        <Link
          href="/admin"
          onClick={onItemClick}
          className="flex items-center space-x-2 font-mono text-sm font-bold text-terminal-text-primary hover:text-terminal-primary transition-colors"
        >
          <Terminal className="w-4 h-4 text-terminal-primary" />
          <span>Developer OS</span>
        </Link>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-terminal-border bg-terminal-surface text-terminal-text-muted">
          admin
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <h3 className="px-2 text-[10px] font-mono font-bold text-terminal-text-muted uppercase tracking-wider">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      'flex items-center space-x-2.5 px-2.5 py-2 rounded text-xs font-mono transition-colors duration-150',
                      isActive
                        ? 'bg-terminal-primary/10 text-terminal-primary font-semibold border border-terminal-primary/20'
                        : 'text-terminal-text-secondary hover:text-terminal-text-primary hover:bg-terminal-surface-alt/50 border border-transparent'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isActive ? 'text-terminal-primary' : 'text-terminal-text-muted'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Status */}
      <div className="p-3.5 border-t border-terminal-border bg-terminal-bg flex items-center justify-between text-[11px] font-mono text-terminal-text-muted">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-terminal-primary animate-pulse" />
          <span>System Online</span>
        </div>
        <span>v1.0</span>
      </div>
    </aside>
  );
}
