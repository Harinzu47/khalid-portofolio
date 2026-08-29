'use client';

import React, { useState, useEffect } from 'react';
import {
  Network,
  Plus,
  ArrowRight,
  ArrowLeft,
  Loader2,
  GitFork,
  Eye,
  Lock,
} from 'lucide-react';
import { getRelationshipsForEntityAction } from '@/actions/relationships';
import { AddConnectionModal } from './AddConnectionModal';
import { ArchiveRelationshipButton } from './ArchiveRelationshipButton';
import type {
  EntityRelationshipsDTO,
  RelationshipListItemDTO,
} from '@/types/dtos';
import {
  type CanonicalEntityType,
  ENTITY_TYPE_LABELS,
} from '@/domain/relationships';

interface EntityConnectionsPanelProps {
  entityType: CanonicalEntityType;
  entityId: string;
  entityTitle?: string;
  initialRelationships?: EntityRelationshipsDTO;
}

export function EntityConnectionsPanel({
  entityType,
  entityId,
  entityTitle,
  initialRelationships,
}: EntityConnectionsPanelProps) {
  const [data, setData] = useState<EntityRelationshipsDTO>(
    initialRelationships || { outgoing: [], incoming: [] }
  );
  const [loading, setLoading] = useState(!initialRelationships);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRelationships = () => {
    setLoading(true);
    getRelationshipsForEntityAction(entityType, entityId).then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  useEffect(() => {
    if (!initialRelationships) {
      fetchRelationships();
    }
  }, [entityType, entityId, initialRelationships]);

  const totalConnections = data.outgoing.length + data.incoming.length;

  return (
    <div className="bg-terminal-surface-card border border-terminal-border rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-terminal-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-terminal-secondary/10 text-terminal-secondary">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-terminal-text-primary flex items-center gap-2">
              <span>Semantic Knowledge Connections</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-terminal-surface-bg border border-terminal-border text-terminal-text-muted font-mono">
                {totalConnections}
              </span>
            </h3>
            <p className="text-xs text-terminal-text-muted">
              Supplementary semantic connections & provenance links (distinct from structural taxonomy).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-terminal-secondary/15 text-terminal-secondary border border-terminal-secondary/30 hover:bg-terminal-secondary/25 transition-colors text-xs font-mono flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Connection</span>
        </button>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-xs text-terminal-text-muted font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-terminal-secondary" />
          Loading semantic graph connections...
        </div>
      ) : totalConnections === 0 ? (
        <div className="text-center py-6 border border-dashed border-terminal-border rounded-lg text-xs text-terminal-text-muted space-y-2">
          <p>No semantic knowledge relationships linked to this {ENTITY_TYPE_LABELS[entityType] || entityType} yet.</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-terminal-secondary hover:underline font-mono text-xs"
          >
            + Connect to another project, article, or note
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Outgoing Connections */}
          {data.outgoing.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-terminal-text-muted">
                <ArrowRight className="w-3.5 h-3.5 text-terminal-secondary" />
                <span>OUTGOING CONNECTIONS ({data.outgoing.length})</span>
              </div>
              <div className="divide-y divide-terminal-border border border-terminal-border rounded-lg bg-terminal-surface-bg/40 overflow-hidden">
                {data.outgoing.map((edge) => (
                  <ConnectionRow
                    key={edge.id}
                    edge={edge}
                    isOutgoing={true}
                    onArchived={fetchRelationships}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Incoming Connections */}
          {data.incoming.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-terminal-text-muted">
                <ArrowLeft className="w-3.5 h-3.5 text-terminal-accent" />
                <span>INCOMING REFERENCES ({data.incoming.length})</span>
              </div>
              <div className="divide-y divide-terminal-border border border-terminal-border rounded-lg bg-terminal-surface-bg/40 overflow-hidden">
                {data.incoming.map((edge) => (
                  <ConnectionRow
                    key={edge.id}
                    edge={edge}
                    isOutgoing={false}
                    onArchived={fetchRelationships}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Connection Modal */}
      <AddConnectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sourceType={entityType}
        sourceId={entityId}
        sourceTitle={entityTitle}
        onSuccess={fetchRelationships}
      />
    </div>
  );
}

interface ConnectionRowProps {
  edge: RelationshipListItemDTO;
  isOutgoing: boolean;
  onArchived?: () => void;
}

function ConnectionRow({ edge, isOutgoing, onArchived }: ConnectionRowProps) {
  const isProvenance = edge.relationshipType.code === 'DERIVED_INTO';
  const targetOrSource = isOutgoing ? edge.target : edge.source;

  return (
    <div className="p-3.5 flex items-center justify-between gap-4 hover:bg-terminal-surface-card/60 transition-colors text-xs">
      <div className="flex items-center gap-3 min-w-0">
        {/* Relationship badge */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${
              isProvenance
                ? 'bg-terminal-warning/10 text-terminal-warning border-terminal-warning/30'
                : 'bg-terminal-secondary/10 text-terminal-secondary border-terminal-secondary/30'
            }`}
          >
            {isOutgoing ? edge.relationshipType.name : edge.relationshipType.inverseLabel}
          </span>
          {isProvenance && (
            <span className="text-[9px] text-terminal-text-muted font-mono flex items-center gap-0.5">
              <GitFork className="w-2.5 h-2.5" /> Provenance
            </span>
          )}
        </div>

        {/* Target/Source details */}
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-terminal-text-muted bg-terminal-surface-card px-1.5 py-0.2 rounded border border-terminal-border">
              {ENTITY_TYPE_LABELS[targetOrSource.entityType] || targetOrSource.entityType}
            </span>
            <span className="font-medium text-terminal-text-primary truncate">
              {targetOrSource.label}
            </span>
          </div>

          {edge.description && (
            <p className="text-[11px] text-terminal-text-muted italic truncate">
              "{edge.description}"
            </p>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Visibility */}
        <div
          className="flex items-center gap-1 text-[11px] font-mono text-terminal-text-muted"
          title={`Edge visibility: ${edge.visibility}`}
        >
          {edge.visibility === 'public' ? (
            <Eye className="w-3.5 h-3.5 text-terminal-success" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-terminal-text-muted" />
          )}
          <span className="capitalize">{edge.visibility}</span>
        </div>

        {/* Archive action */}
        <ArchiveRelationshipButton
          relationshipId={edge.id}
          relationshipTypeCode={edge.relationshipType.code}
          isProvenance={isProvenance}
          onSuccess={onArchived}
        />
      </div>
    </div>
  );
}
