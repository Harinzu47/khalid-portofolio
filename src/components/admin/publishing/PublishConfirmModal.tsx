'use client';

import React, { useState, useEffect } from 'react';
import { getPublicImpactPreviewAction, publishNowAction } from '@/actions/publishing';
import type { PublishableEntityType } from '@/domain/publishing';
import type { PublicImpactPreviewDTO } from '@/types/dtos/publishing.dto';

interface PublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: PublishableEntityType;
  entityId: string;
  entityTitle: string;
  onSuccess: () => void;
}

export function PublishConfirmModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  onSuccess,
}: PublishConfirmModalProps) {
  const [preview, setPreview] = useState<PublicImpactPreviewDTO | null>(null);
  const [fetching, setFetching] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setFetching(true);
    setError(null);

    getPublicImpactPreviewAction(entityType, entityId, 'public', 'published')
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data) {
          setPreview(res.data);
        } else {
          setError(res.error || 'Failed to load public impact preview.');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Error loading preview.');
      })
      .finally(() => {
        if (mounted) setFetching(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, entityType, entityId]);

  if (!isOpen) return null;

  const handlePublish = async () => {
    setError(null);
    setPublishing(true);

    try {
      const res = await publishNowAction({
        entityType,
        entityId,
      });

      if (!res.success) {
        setError(res.error || 'Failed to publish.');
        setPublishing(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unexpected publication error.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">Publish to Live</h3>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
            {entityTitle}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        {fetching ? (
          <div className="py-8 flex items-center justify-center space-x-2 text-zinc-400 text-xs">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Calculating public impact preview...</span>
          </div>
        ) : preview ? (
          <div className="space-y-3.5 text-xs text-zinc-300">
            <div className="p-3 bg-zinc-800/80 rounded-lg border border-zinc-700/80 space-y-2">
              <div className="flex justify-between items-center text-[11px] text-zinc-400">
                <span>Public Route Destination:</span>
                <span className="font-mono text-zinc-200 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-700">
                  {preview.publicRoute || 'Feed Aggregation (no direct URL)'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-zinc-400">
                <span>Discoverability:</span>
                <span className="font-medium text-emerald-400">
                  {preview.targetVisibility.toUpperCase()} + {preview.targetPublicationStatus.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <p className="text-[11px] text-zinc-400">Visible Graph Edges</p>
                <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                  {preview.eligibleRelationshipsCount}
                </p>
              </div>
              <div className="p-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                <p className="text-[11px] text-zinc-400">Hidden Private Edges</p>
                <p className="text-sm font-semibold text-zinc-400 mt-0.5">
                  {preview.hiddenPrivateRelationshipsCount}
                </p>
              </div>
            </div>

            {preview.warnings && preview.warnings.length > 0 && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg space-y-1">
                <p className="font-medium text-amber-300 text-[11px]">Advisory Warnings (Non-Blocking):</p>
                <ul className="list-disc list-inside text-[11px] text-amber-200/90 space-y-0.5">
                  {preview.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={publishing}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || fetching}
            className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {publishing ? 'Publishing...' : 'Confirm & Publish Live'}
          </button>
        </div>
      </div>
    </div>
  );
}
