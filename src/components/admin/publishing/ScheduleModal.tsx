'use client';

import React, { useState } from 'react';
import { schedulePublicationAction } from '@/actions/publishing';
import type { PublishableEntityType } from '@/domain/publishing';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: PublishableEntityType;
  entityId: string;
  entityTitle: string;
  currentScheduledAt?: string | null;
  onSuccess: () => void;
}

export function ScheduleModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  currentScheduledAt,
  onSuccess,
}: ScheduleModalProps) {
  const [scheduledDateTime, setScheduledDateTime] = useState(() => {
    if (currentScheduledAt) {
      const d = new Date(currentScheduledAt);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    }
    // Default to tomorrow 09:00 local time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const dateObj = new Date(scheduledDateTime);
      if (dateObj.getTime() <= Date.now()) {
        setError('Scheduled date & time must be in the future.');
        setLoading(false);
        return;
      }

      const res = await schedulePublicationAction({
        entityType,
        entityId,
        scheduledAt: dateObj.toISOString(),
      });

      if (!res.success) {
        setError(res.error || 'Failed to schedule publication.');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unexpected scheduling error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">Schedule Publication</h3>
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
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Publish Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Timezone: <span className="font-medium text-zinc-300">{timezoneName}</span>
            </p>
          </div>

          <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-lg p-3 text-xs text-zinc-400 space-y-1">
            <p className="font-medium text-zinc-200">Scheduled Execution Rule:</p>
            <p>
              When the scheduled timestamp arrives, the automated publication scheduler will verify full publication readiness and publish the content.
            </p>
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
              {loading ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
