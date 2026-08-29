'use client';

import React, { useState } from 'react';
import { changeVisibilityAction } from '@/actions/publishing';
import type { PublishableEntityType, Visibility } from '@/domain/publishing';

interface ChangeVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: PublishableEntityType;
  entityId: string;
  entityTitle: string;
  currentVisibility: Visibility;
  onSuccess: () => void;
}

export function ChangeVisibilityModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  currentVisibility,
  onSuccess,
}: ChangeVisibilityModalProps) {
  const [selectedVisibility, setSelectedVisibility] = useState<Visibility>(currentVisibility);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVisibility === currentVisibility) {
      onClose();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await changeVisibilityAction({
        entityType,
        entityId,
        visibility: selectedVisibility,
      });

      if (!res.success) {
        setError(res.error || 'Failed to change visibility.');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unexpected visibility error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">Change Visibility Scope</h3>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
            {entityTitle}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {[
              {
                value: 'private',
                label: 'PRIVATE',
                description: 'Only accessible in the private owner console. Excluded from all public feeds and routes.',
              },
              {
                value: 'unlisted',
                label: 'UNLISTED',
                description: 'Direct route resolvable for sharing. Excluded from normal listings, search feeds, and sitemap.',
              },
              {
                value: 'public',
                label: 'PUBLIC',
                description: 'Eligible for normal public listings, search indexes, graph discovery, and sitemap when published.',
              },
            ].map((option) => (
              <label
                key={option.value}
                className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedVisibility === option.value
                    ? 'bg-zinc-800 border-blue-500/80 ring-1 ring-blue-500/50'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="visibilityOption"
                    value={option.value}
                    checked={selectedVisibility === option.value}
                    onChange={() => setSelectedVisibility(option.value as Visibility)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-xs text-zinc-100">{option.label}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 pl-6 leading-relaxed">
                  {option.description}
                </p>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {loading ? 'Saving...' : 'Apply Visibility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
