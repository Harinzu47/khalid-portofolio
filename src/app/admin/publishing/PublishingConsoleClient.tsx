'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  PUBLISHABLE_ENTITY_TYPES,
  type PublishableEntityType,
  type PublicationStatus,
  type Visibility,
} from '@/domain/publishing';
import type {
  PublishingListItemDTO,
  PublishingOverviewDTO,
} from '@/types/dtos/publishing.dto';
import { PublishConfirmModal } from '@/components/admin/publishing/PublishConfirmModal';
import { ScheduleModal } from '@/components/admin/publishing/ScheduleModal';

interface PublishingConsoleClientProps {
  initialOverview: PublishingOverviewDTO;
  initialItems: PublishingListItemDTO[];
}

export function PublishingConsoleClient({
  initialOverview,
  initialItems,
}: PublishingConsoleClientProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [items, setItems] = useState<PublishingListItemDTO[]>(initialItems);
  const [overview] = useState<PublishingOverviewDTO>(initialOverview);

  // Quick Action Modal
  const [activeAction, setActiveAction] = useState<{
    type: 'publish' | 'schedule';
    entityType: PublishableEntityType;
    entityId: string;
    entityTitle: string;
  } | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'draft' && item.publicationStatus !== 'draft') return false;
      if (activeTab === 'review' && item.publicationStatus !== 'review') return false;
      if (activeTab === 'scheduled' && item.publicationStatus !== 'scheduled') return false;
      if (activeTab === 'published' && item.publicationStatus !== 'published') return false;
      if (activeTab === 'archived' && item.publicationStatus !== 'archived') return false;
      if (activeTab === 'unlisted' && item.visibility !== 'unlisted') return false;
      if (activeTab === 'private' && item.visibility !== 'private') return false;
      if (activeTab === 'attention' && !item.hasReadinessErrors && !item.hasReadinessWarnings) return false;

      // Type filter
      if (selectedType !== 'all' && item.entityType !== selectedType) return false;

      // Search filter (Amendment 47: simple filtering)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSlug = item.slug?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSlug) return false;
      }

      return true;
    });
  }, [items, activeTab, selectedType, searchQuery]);

  const getEntityEditUrl = (type: PublishableEntityType, id: string) => {
    switch (type) {
      case 'ARTICLE':
        return `/admin/articles/${id}/edit`;
      case 'TECH_NOTE':
        return `/admin/notes/${id}/edit`;
      case 'ADR':
        return `/admin/adrs/${id}/edit`;
      case 'JOURNAL_ENTRY':
        return `/admin/journal/${id}/edit`;
      case 'PROJECT':
        return `/admin/projects/${id}/edit`;
      case 'PROJECT_CASE_STUDY':
        return `/admin/projects`;
      case 'EXPERIENCE':
        return `/admin/career/${id}/edit`;
      case 'LEARNING_PATH':
        return `/admin/learning/paths/${id}/edit`;
      case 'ROADMAP':
        return `/admin/roadmap/${id}/edit`;
      case 'CERTIFICATE':
        return `/admin/certificates/${id}/edit`;
      case 'NOW_ENTRY':
        return `/admin/now/${id}/edit`;
      default:
        return '/admin';
    }
  };

  const getStatusBadge = (s: PublicationStatus) => {
    switch (s) {
      case 'published':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'archived':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'draft':
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-700';
    }
  };

  const getVisibilityBadge = (v: Visibility) => {
    switch (v) {
      case 'public':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'unlisted':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'private':
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Entities', count: overview.total, color: 'text-zinc-100' },
          { label: 'Published', count: overview.published, color: 'text-emerald-400' },
          { label: 'In Review', count: overview.review, color: 'text-amber-400' },
          { label: 'Scheduled', count: overview.scheduled, color: 'text-blue-400' },
          { label: 'Drafts', count: overview.draft, color: 'text-zinc-400' },
          { label: 'Unlisted', count: overview.unlisted, color: 'text-amber-300' },
          { label: 'Archived', count: overview.archived, color: 'text-rose-400' },
          { label: 'Needs Attention', count: overview.needsAttention, color: 'text-rose-300' },
        ].map((card, idx) => (
          <div
            key={idx}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col justify-between"
          >
            <span className="text-[11px] text-zinc-400">{card.label}</span>
            <span className={`text-xl font-bold mt-1 ${card.color}`}>{card.count}</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'published', label: 'Published' },
            { id: 'review', label: 'In Review' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'draft', label: 'Drafts' },
            { id: 'unlisted', label: 'Unlisted' },
            { id: 'private', label: 'Private' },
            { id: 'archived', label: 'Archived' },
            { id: 'attention', label: 'Needs Attention' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Type Select */}
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Entity Types</option>
            {PUBLISHABLE_ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 md:w-56"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/60 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4">Readiness</th>
                <th className="py-3 px-4">Timestamps</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 text-xs">
                    No entities found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={`${item.entityType}-${item.id}`} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-zinc-100 max-w-xs truncate">
                        <Link
                          href={getEntityEditUrl(item.entityType, item.id)}
                          className="hover:text-blue-400 transition-colors"
                        >
                          {item.title}
                        </Link>
                      </div>
                      {item.slug && (
                        <div className="text-[11px] font-mono text-zinc-500 truncate max-w-xs">
                          /{item.slug}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {item.entityTypeLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusBadge(item.publicationStatus)}`}>
                        {item.publicationStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getVisibilityBadge(item.visibility)}`}>
                        {item.visibility}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.hasReadinessErrors ? (
                        <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Has Errors
                        </span>
                      ) : item.hasReadinessWarnings ? (
                        <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Advisory
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Ready
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-[11px] text-zinc-400 font-mono">
                      {item.publishedAt ? (
                        <span>Pub: {new Date(item.publishedAt).toLocaleDateString()}</span>
                      ) : item.scheduledPublishAt ? (
                        <span className="text-blue-400">Sched: {new Date(item.scheduledPublishAt).toLocaleDateString()}</span>
                      ) : (
                        <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-2">
                      <Link
                        href={getEntityEditUrl(item.entityType, item.id)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors inline-block"
                      >
                        Edit
                      </Link>

                      {item.publicationStatus !== 'published' && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveAction({
                              type: 'publish',
                              entityType: item.entityType,
                              entityId: item.id,
                              entityTitle: item.title,
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600/90 hover:bg-emerald-600 text-white rounded transition-colors"
                        >
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Modal */}
      {activeAction?.type === 'publish' && (
        <PublishConfirmModal
          isOpen={true}
          onClose={() => setActiveAction(null)}
          entityType={activeAction.entityType}
          entityId={activeAction.entityId}
          entityTitle={activeAction.entityTitle}
          onSuccess={() => {
            // Update item in local list
            setItems((prev) =>
              prev.map((i) =>
                i.id === activeAction.entityId && i.entityType === activeAction.entityType
                  ? { ...i, publicationStatus: 'published', publishedAt: new Date().toISOString() }
                  : i
              )
            );
          }}
        />
      )}
    </div>
  );
}
