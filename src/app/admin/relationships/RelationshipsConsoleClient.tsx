'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Network,
  Activity,
  Filter,
  Eye,
  Lock,
  GitFork,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { RelationshipHealthDrawer } from '@/components/admin/relationships/RelationshipHealthDrawer';
import { ArchiveRelationshipButton } from '@/components/admin/relationships/ArchiveRelationshipButton';
import type { RelationshipListItemDTO } from '@/types/dtos';
import {
  CANONICAL_ENTITY_TYPES,
  RELATIONSHIP_TYPE_CODES,
  ENTITY_TYPE_LABELS,
} from '@/domain/relationships';

interface RelationshipsConsoleClientProps {
  initialEdges: RelationshipListItemDTO[];
}

export function RelationshipsConsoleClient({
  initialEdges,
}: RelationshipsConsoleClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [healthDrawerOpen, setHealthDrawerOpen] = useState(false);

  const selectedType = searchParams.get('type') || '';
  const selectedSourceType = searchParams.get('sourceType') || '';
  const selectedTargetType = searchParams.get('targetType') || '';
  const selectedVisibility = searchParams.get('visibility') || '';
  const selectedStatus = searchParams.get('status') || 'active';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/relationships?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-terminal-text-primary">
              Semantic Relationship Console
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-terminal-secondary/10 border border-terminal-secondary/30 text-terminal-secondary font-mono">
              Knowledge Graph
            </span>
          </div>
          <p className="text-xs text-terminal-text-muted mt-1">
            Global management & integrity diagnostics for supplementary semantic connections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHealthDrawerOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-terminal-warning/10 border border-terminal-warning/30 text-terminal-warning hover:bg-terminal-warning/20 transition-colors text-xs font-mono flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Graph Health Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-terminal-surface-card border border-terminal-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-terminal-text-muted">
          <Filter className="w-3.5 h-3.5 text-terminal-secondary" />
          <span>FILTER RELATIONSHIPS</span>
        </div>

        <div className="grid grid-cols-5 gap-3 text-xs">
          {/* 1. Relationship Type */}
          <div>
            <label className="block text-[11px] font-mono text-terminal-text-muted mb-1">
              RELATIONSHIP TYPE
            </label>
            <select
              value={selectedType}
              onChange={(e) => updateFilters('type', e.target.value)}
              className="w-full bg-terminal-surface-bg border border-terminal-border rounded-lg px-2.5 py-1.5 text-terminal-text-primary text-xs font-mono focus:outline-none focus:border-terminal-secondary"
            >
              <option value="">All Types</option>
              {RELATIONSHIP_TYPE_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Source Type */}
          <div>
            <label className="block text-[11px] font-mono text-terminal-text-muted mb-1">
              SOURCE TYPE
            </label>
            <select
              value={selectedSourceType}
              onChange={(e) => updateFilters('sourceType', e.target.value)}
              className="w-full bg-terminal-surface-bg border border-terminal-border rounded-lg px-2.5 py-1.5 text-terminal-text-primary text-xs font-mono focus:outline-none focus:border-terminal-secondary"
            >
              <option value="">All Sources</option>
              {CANONICAL_ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ENTITY_TYPE_LABELS[type] || type}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Target Type */}
          <div>
            <label className="block text-[11px] font-mono text-terminal-text-muted mb-1">
              TARGET TYPE
            </label>
            <select
              value={selectedTargetType}
              onChange={(e) => updateFilters('targetType', e.target.value)}
              className="w-full bg-terminal-surface-bg border border-terminal-border rounded-lg px-2.5 py-1.5 text-terminal-text-primary text-xs font-mono focus:outline-none focus:border-terminal-secondary"
            >
              <option value="">All Targets</option>
              {CANONICAL_ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ENTITY_TYPE_LABELS[type] || type}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Visibility */}
          <div>
            <label className="block text-[11px] font-mono text-terminal-text-muted mb-1">
              VISIBILITY
            </label>
            <select
              value={selectedVisibility}
              onChange={(e) => updateFilters('visibility', e.target.value)}
              className="w-full bg-terminal-surface-bg border border-terminal-border rounded-lg px-2.5 py-1.5 text-terminal-text-primary text-xs font-mono focus:outline-none focus:border-terminal-secondary"
            >
              <option value="">All Visibilities</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
          </div>

          {/* 5. Status */}
          <div>
            <label className="block text-[11px] font-mono text-terminal-text-muted mb-1">
              STATUS
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => updateFilters('status', e.target.value)}
              className="w-full bg-terminal-surface-bg border border-terminal-border rounded-lg px-2.5 py-1.5 text-terminal-text-primary text-xs font-mono focus:outline-none focus:border-terminal-secondary"
            >
              <option value="active">Active Only</option>
              <option value="archived">Archived</option>
              <option value="">All States</option>
            </select>
          </div>
        </div>
      </div>

      {/* Relationships Table */}
      <div className="bg-terminal-surface-card border border-terminal-border rounded-xl overflow-hidden shadow-sm">
        {initialEdges.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Network className="w-8 h-8 text-terminal-text-muted mx-auto opacity-50" />
            <p className="text-sm font-mono text-terminal-text-muted">
              No semantic relationships found matching the active filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-terminal-border bg-terminal-surface-bg/50 text-[11px] font-mono text-terminal-text-muted">
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">SOURCE ENTITY</th>
                  <th className="py-3 px-4"></th>
                  <th className="py-3 px-4">TARGET ENTITY</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-4">VISIBILITY</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border">
                {initialEdges.map((edge) => {
                  const isProvenance = edge.relationshipType.code === 'DERIVED_INTO';
                  return (
                    <tr
                      key={edge.id}
                      className="hover:bg-terminal-surface-bg/40 transition-colors"
                    >
                      {/* Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border inline-block w-fit ${
                              isProvenance
                                ? 'bg-terminal-warning/10 text-terminal-warning border-terminal-warning/30'
                                : 'bg-terminal-secondary/10 text-terminal-secondary border-terminal-secondary/30'
                            }`}
                          >
                            {edge.relationshipType.code}
                          </span>
                          {isProvenance && (
                            <span className="text-[9px] text-terminal-text-muted font-mono flex items-center gap-0.5">
                              <GitFork className="w-2.5 h-2.5" /> Provenance
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          <span className="text-[10px] font-mono text-terminal-text-muted bg-terminal-surface-bg px-1.5 py-0.2 rounded border border-terminal-border">
                            {ENTITY_TYPE_LABELS[edge.source.entityType] || edge.source.entityType}
                          </span>
                          <p className="font-medium text-terminal-text-primary truncate">
                            {edge.source.label}
                          </p>
                        </div>
                      </td>

                      {/* Arrow */}
                      <td className="py-3 px-2 text-terminal-text-muted">
                        <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                      </td>

                      {/* Target */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          <span className="text-[10px] font-mono text-terminal-text-muted bg-terminal-surface-bg px-1.5 py-0.2 rounded border border-terminal-border">
                            {ENTITY_TYPE_LABELS[edge.target.entityType] || edge.target.entityType}
                          </span>
                          <p className="font-medium text-terminal-text-primary truncate">
                            {edge.target.label}
                          </p>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-terminal-text-muted italic max-w-xs truncate">
                        {edge.description ? `"${edge.description}"` : '—'}
                      </td>

                      {/* Visibility */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-terminal-text-muted">
                          {edge.visibility === 'public' ? (
                            <Eye className="w-3.5 h-3.5 text-terminal-success" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-terminal-text-muted" />
                          )}
                          <span className="capitalize">{edge.visibility}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            edge.status === 'active'
                              ? 'bg-terminal-success/10 text-terminal-success border border-terminal-success/30'
                              : 'bg-terminal-text-muted/10 text-terminal-text-muted border border-terminal-border'
                          }`}
                        >
                          {edge.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {edge.status === 'active' && (
                          <ArchiveRelationshipButton
                            relationshipId={edge.id}
                            relationshipTypeCode={edge.relationshipType.code}
                            isProvenance={isProvenance}
                            onSuccess={() => router.refresh()}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Health Diagnostics Drawer */}
      <RelationshipHealthDrawer
        isOpen={healthDrawerOpen}
        onClose={() => setHealthDrawerOpen(false)}
      />
    </div>
  );
}
