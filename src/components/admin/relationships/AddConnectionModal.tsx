'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Link as LinkIcon,
  Loader2,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  getCompatibleRelationshipTypesAction,
  getCompatibleTargetTypesAction,
  searchRelationshipCandidatesAction,
  createRelationshipAction,
} from '@/actions/relationships';
import type {
  RelationshipTypeDTO,
  RelationshipCandidateDTO,
} from '@/types/dtos';
import {
  type CanonicalEntityType,
  ENTITY_TYPE_LABELS,
} from '@/domain/relationships';

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: CanonicalEntityType;
  sourceId: string;
  sourceTitle?: string;
  onSuccess?: () => void;
}

export function AddConnectionModal({
  isOpen,
  onClose,
  sourceType,
  sourceId,
  sourceTitle,
  onSuccess,
}: AddConnectionModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Step state
  const [relTypes, setRelTypes] = useState<RelationshipTypeDTO[]>([]);
  const [selectedRelTypeId, setSelectedRelTypeId] = useState<string>('');
  const [targetTypes, setTargetTypes] = useState<CanonicalEntityType[]>([]);
  const [selectedTargetType, setSelectedTargetType] = useState<CanonicalEntityType | ''>('');
  const [candidateQuery, setCandidateQuery] = useState('');
  const [candidates, setCandidates] = useState<RelationshipCandidateDTO[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private');

  // Loading & error states
  const [loadingRelTypes, setLoadingRelTypes] = useState(false);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Fetch compatible relationship types when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setLoadingRelTypes(true);
    setFormError(null);
    getCompatibleRelationshipTypesAction(sourceType).then((res) => {
      setLoadingRelTypes(false);
      if (res.success && res.data) {
        setRelTypes(res.data);
        if (res.data.length > 0) {
          setSelectedRelTypeId(res.data[0].id);
        }
      } else {
        setFormError(res.error || 'Failed to fetch relationship types.');
      }
    });
  }, [isOpen, sourceType]);

  // 2. Fetch compatible target types when selected relationship type changes
  useEffect(() => {
    if (!selectedRelTypeId) {
      setTargetTypes([]);
      setSelectedTargetType('');
      return;
    }

    setLoadingTargets(true);
    getCompatibleTargetTypesAction(sourceType, selectedRelTypeId).then((res) => {
      setLoadingTargets(false);
      if (res.success && res.data) {
        setTargetTypes(res.data);
        if (res.data.length > 0) {
          setSelectedTargetType(res.data[0]);
        } else {
          setSelectedTargetType('');
        }
      } else {
        setFormError(res.error || 'Failed to fetch compatible targets.');
      }
    });
  }, [sourceType, selectedRelTypeId]);

  // 3. Search candidates when target type or query changes
  useEffect(() => {
    if (!selectedTargetType || !selectedRelTypeId) {
      setCandidates([]);
      setSelectedTargetId('');
      return;
    }

    setLoadingCandidates(true);
    const timeout = setTimeout(() => {
      searchRelationshipCandidatesAction({
        sourceType,
        sourceId,
        relationshipTypeId: selectedRelTypeId,
        targetType: selectedTargetType,
        query: candidateQuery,
        limit: 20,
      }).then((res) => {
        setLoadingCandidates(false);
        if (res.success && res.data) {
          setCandidates(res.data);
          if (res.data.length > 0) {
            setSelectedTargetId(res.data[0].id);
          } else {
            setSelectedTargetId('');
          }
        } else {
          setFormError(res.error || 'Failed to find candidates.');
        }
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [sourceType, sourceId, selectedRelTypeId, selectedTargetType, candidateQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRelTypeId || !selectedTargetType || !selectedTargetId) {
      setFormError('Please complete all connection fields.');
      return;
    }

    setFormError(null);
    startTransition(async () => {
      const res = await createRelationshipAction({
        relationshipTypeId: selectedRelTypeId,
        sourceType,
        sourceId,
        targetType: selectedTargetType,
        targetId: selectedTargetId,
        description: description.trim() || undefined,
        visibility,
        sortOrder: 0,
      });

      if (res.success) {
        onSuccess?.();
        router.refresh();
        onClose();
      } else {
        setFormError(res.error || 'Failed to create connection.');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-terminal-bg/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-terminal-surface-card border border-terminal-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-terminal-border bg-terminal-surface-bg/50">
          <div className="flex items-center gap-2 text-terminal-text-primary font-mono text-sm font-semibold">
            <LinkIcon className="w-4 h-4 text-terminal-secondary" />
            <span>Add Semantic Connection</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-terminal-text-muted hover:text-terminal-text-primary transition-colors p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source context summary */}
        <div className="px-6 py-3 bg-terminal-surface-bg/30 border-b border-terminal-border text-xs flex items-center gap-2">
          <span className="text-terminal-text-muted font-mono">FROM:</span>
          <span className="bg-terminal-surface-card px-2 py-0.5 rounded border border-terminal-border font-mono text-[11px] text-terminal-secondary">
            {ENTITY_TYPE_LABELS[sourceType] || sourceType}
          </span>
          <span className="text-terminal-text-primary truncate font-medium">
            {sourceTitle || sourceId}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {formError && (
            <div className="p-3 bg-terminal-error/10 border border-terminal-error/30 rounded-lg flex items-start gap-2 text-xs text-terminal-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Relationship Type */}
          <div>
            <label className="block text-xs font-mono text-terminal-text-muted mb-1">
              RELATIONSHIP MEANING
            </label>
            {loadingRelTypes ? (
              <div className="flex items-center gap-2 text-xs text-terminal-text-muted py-2 font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading compatible types...
              </div>
            ) : relTypes.length === 0 ? (
              <p className="text-xs text-terminal-text-muted italic py-1">
                No compatible relationship types available for this entity type.
              </p>
            ) : (
              <select
                value={selectedRelTypeId}
                onChange={(e) => setSelectedRelTypeId(e.target.value)}
                className="w-full bg-terminal-surface-bg border border-terminal-border rounded-lg px-3 py-2 text-terminal-text-primary text-xs font-mono focus:outline-none focus:border-terminal-secondary"
              >
                {relTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code}) — {t.description || t.inverseLabel}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Target Entity Type */}
          <div>
            <label className="block text-xs font-mono text-terminal-text-muted mb-1">
              TARGET ENTITY TYPE
            </label>
            {loadingTargets ? (
              <div className="flex items-center gap-2 text-xs text-terminal-text-muted py-2 font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading target types...
              </div>
            ) : targetTypes.length === 0 ? (
              <p className="text-xs text-terminal-text-muted italic py-1">
                No target types allowed for this relationship.
              </p>
            ) : (
              <select
                value={selectedTargetType}
                onChange={(e) => setSelectedTargetType(e.target.value as CanonicalEntityType)}
                className="w-full bg-terminal-surface-bg border border-terminal-border rounded-lg px-3 py-2 text-terminal-text-primary text-xs font-mono focus:outline-none focus:border-terminal-secondary"
              >
                {targetTypes.map((type) => (
                  <option key={type} value={type}>
                    {ENTITY_TYPE_LABELS[type] || type}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3. Target Entity Candidate Selection */}
          {selectedTargetType && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-terminal-text-muted">
                  SELECT TARGET ENTITY
                </label>
                {loadingCandidates && (
                  <span className="text-[11px] text-terminal-text-muted font-mono flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Searching...
                  </span>
                )}
              </div>

              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-terminal-text-muted" />
                <input
                  type="text"
                  placeholder={`Search ${ENTITY_TYPE_LABELS[selectedTargetType] || selectedTargetType}...`}
                  value={candidateQuery}
                  onChange={(e) => setCandidateQuery(e.target.value)}
                  className="w-full bg-terminal-surface-bg border border-terminal-border rounded-lg pl-8 pr-3 py-1.5 text-terminal-text-primary text-xs focus:outline-none focus:border-terminal-secondary"
                />
              </div>

              {candidates.length === 0 && !loadingCandidates ? (
                <div className="p-3 bg-terminal-surface-bg/40 border border-terminal-border rounded-lg text-center text-xs text-terminal-text-muted">
                  No matching {ENTITY_TYPE_LABELS[selectedTargetType]} entities found.
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto border border-terminal-border rounded-lg divide-y divide-terminal-border bg-terminal-surface-bg">
                  {candidates.map((cand) => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => setSelectedTargetId(cand.id)}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                        selectedTargetId === cand.id
                          ? 'bg-terminal-secondary/15 text-terminal-text-primary'
                          : 'hover:bg-terminal-surface-card text-terminal-text-muted hover:text-terminal-text-primary'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-medium truncate">{cand.label}</p>
                        {cand.slug && (
                          <p className="text-[10px] text-terminal-text-muted font-mono truncate">
                            /{cand.slug}
                          </p>
                        )}
                      </div>
                      {selectedTargetId === cand.id && (
                        <CheckCircle2 className="w-4 h-4 text-terminal-secondary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Description & Visibility */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="col-span-2">
              <label className="block text-xs font-mono text-terminal-text-muted mb-1">
                DESCRIPTION / REASON (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="Why does this connection exist?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="w-full bg-terminal-surface-bg border border-terminal-border rounded-lg px-3 py-1.5 text-terminal-text-primary text-xs focus:outline-none focus:border-terminal-secondary"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-terminal-text-muted mb-1">
                VISIBILITY
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full bg-terminal-surface-bg border border-terminal-border rounded-lg px-2.5 py-1.5 text-terminal-text-primary text-xs font-mono focus:outline-none focus:border-terminal-secondary"
              >
                <option value="private">Private (Default)</option>
                <option value="unlisted">Unlisted</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-terminal-text-muted italic pt-1">
            Note: Public edges are only discoverable when both connected entities are also published and public.
          </p>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-terminal-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-1.5 rounded-lg border border-terminal-border text-xs text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !selectedTargetId}
              className="px-4 py-1.5 rounded-lg bg-terminal-secondary text-terminal-bg font-semibold text-xs flex items-center gap-1.5 hover:bg-terminal-secondary/90 transition-colors disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Connection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
