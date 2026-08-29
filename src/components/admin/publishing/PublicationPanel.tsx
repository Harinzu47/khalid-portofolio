'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getPublicationReadinessAction,
  submitForReviewAction,
  returnToDraftAction,
  unpublishAction,
  archivePublicationAction,
  restorePublicationAction,
} from '@/actions/publishing';
import { ScheduleModal } from './ScheduleModal';
import { PublishConfirmModal } from './PublishConfirmModal';
import { ChangeVisibilityModal } from './ChangeVisibilityModal';
import {
  PUBLISHABLE_ENTITY_CAPABILITIES,
  getAllowedCommandsForStatus,
  type PublishableEntityType,
  type PublicationStatus,
  type Visibility,
} from '@/domain/publishing';
import type { PublicationReadinessDTO } from '@/types/dtos/publishing.dto';

interface PublicationPanelProps {
  entityType: PublishableEntityType;
  entityId: string;
  entityTitle: string;
  initialVisibility: Visibility;
  initialPublicationStatus: PublicationStatus;
  initialPublishedAt?: string | null;
  initialScheduledPublishAt?: string | null;
  initialArchivedAt?: string | null;
  onStateChange?: () => void;
}

export function PublicationPanel({
  entityType,
  entityId,
  entityTitle,
  initialVisibility,
  initialPublicationStatus,
  initialPublishedAt,
  initialScheduledPublishAt,
  initialArchivedAt,
  onStateChange,
}: PublicationPanelProps) {
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [status, setStatus] = useState<PublicationStatus>(initialPublicationStatus);
  const [publishedAt, setPublishedAt] = useState<string | null>(initialPublishedAt || null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(initialScheduledPublishAt || null);
  const [archivedAt, setArchivedAt] = useState<string | null>(initialArchivedAt || null);

  const [readiness, setReadiness] = useState<PublicationReadinessDTO | null>(null);
  const [loadingReadiness, setLoadingReadiness] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [showIssuesDrawer, setShowIssuesDrawer] = useState(false);

  const capability = PUBLISHABLE_ENTITY_CAPABILITIES[entityType];
  const allowedCommands = getAllowedCommandsForStatus(status, capability);

  const fetchReadiness = useCallback(async () => {
    setLoadingReadiness(true);
    try {
      const res = await getPublicationReadinessAction(entityType, entityId);
      if (res.success && res.data) {
        setReadiness(res.data);
      }
    } catch {
      // Non-critical background check
    } finally {
      setLoadingReadiness(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness, status, visibility]);

  const handleRefresh = () => {
    fetchReadiness();
    if (onStateChange) onStateChange();
  };

  const handleSimpleCommand = async (
    commandFn: () => Promise<any>,
    successCallback?: () => void
  ) => {
    setError(null);
    setActionLoading(true);
    try {
      const res = await commandFn();
      if (!res.success) {
        setError(res.error?.message || 'Operation failed.');
        return;
      }
      if (res.data) {
        setStatus(res.data.publicationStatus);
        setVisibility(res.data.visibility);
        setPublishedAt(res.data.publishedAt);
        setScheduledAt(res.data.scheduledPublishAt);
        setArchivedAt(res.data.archivedAt);
      }
      if (successCallback) successCallback();
      handleRefresh();
    } catch (err: any) {
      setError(err?.message || 'Unexpected action error.');
    } finally {
      setActionLoading(false);
    }
  };

  const getVisibilityBadgeColor = (v: Visibility) => {
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

  const getStatusBadgeColor = (s: PublicationStatus) => {
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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Publication & Lifecycle
        </h4>
        <button
          type="button"
          onClick={() => window.open(`/admin/preview/${entityType}/${entityId}`, '_blank')}
          className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          <span>Preview</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="p-2.5 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Badges & Meta */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Status:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase border ${getStatusBadgeColor(status)}`}>
            {status}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Visibility:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase border ${getVisibilityBadgeColor(visibility)}`}>
            {visibility}
          </span>
        </div>

        {publishedAt && (
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
            <span>Published:</span>
            <span className="text-zinc-300 font-mono">
              {new Date(publishedAt).toLocaleDateString()} {new Date(publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {scheduledAt && status === 'scheduled' && (
          <div className="flex items-center justify-between text-[11px] text-blue-400 pt-1 border-t border-zinc-800/60">
            <span>Scheduled For:</span>
            <span className="font-mono">
              {new Date(scheduledAt).toLocaleDateString()} {new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {archivedAt && status === 'archived' && (
          <div className="flex items-center justify-between text-[11px] text-rose-400 pt-1 border-t border-zinc-800/60">
            <span>Archived:</span>
            <span className="font-mono">
              {new Date(archivedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Readiness Status Box */}
      <div className="bg-zinc-800/40 border border-zinc-800 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-300">Readiness Check</span>
          {loadingReadiness ? (
            <span className="text-[11px] text-zinc-500">Checking...</span>
          ) : readiness?.hasErrors ? (
            <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Blocked ({readiness.issues.filter((i) => i.severity === 'error').length} Errors)
            </span>
          ) : readiness?.hasWarnings ? (
            <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Ready ({readiness.issues.filter((i) => i.severity === 'warning').length} Warnings)
            </span>
          ) : (
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Passed
            </span>
          )}
        </div>

        {readiness && readiness.issues.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowIssuesDrawer(!showIssuesDrawer)}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 underline"
            >
              {showIssuesDrawer ? 'Hide issues' : `View ${readiness.issues.length} diagnostics`}
            </button>

            {showIssuesDrawer && (
              <ul className="mt-2 space-y-1.5 text-[11px] border-t border-zinc-700/60 pt-2">
                {readiness.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span
                      className={`px-1 py-0.2 rounded text-[9px] uppercase font-bold tracking-wider shrink-0 ${
                        issue.severity === 'error'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : issue.severity === 'warning'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-zinc-300 leading-snug">{issue.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Command Actions (Policy-Driven via allowedCommands) */}
      <div className="space-y-2 pt-1 border-t border-zinc-800">
        {allowedCommands.includes('PUBLISH_NOW') && (
          <button
            type="button"
            onClick={() => setIsPublishOpen(true)}
            disabled={actionLoading}
            className="w-full py-2 px-3 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            Publish Live...
          </button>
        )}

        {allowedCommands.includes('SUBMIT_FOR_REVIEW') && (
          <button
            type="button"
            onClick={() => handleSimpleCommand(() => submitForReviewAction({ entityType, entityId }))}
            disabled={actionLoading}
            className="w-full py-2 px-3 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            Submit for Review
          </button>
        )}

        {allowedCommands.includes('SCHEDULE') && (
          <button
            type="button"
            onClick={() => setIsScheduleOpen(true)}
            disabled={actionLoading}
            className="w-full py-2 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            {status === 'scheduled' ? 'Reschedule...' : 'Schedule Publication...'}
          </button>
        )}

        {allowedCommands.includes('RETURN_TO_DRAFT') && (
          <button
            type="button"
            onClick={() => handleSimpleCommand(() => returnToDraftAction({ entityType, entityId }))}
            disabled={actionLoading}
            className="w-full py-1.5 px-3 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Return to Draft
          </button>
        )}

        {allowedCommands.includes('UNPUBLISH') && (
          <button
            type="button"
            onClick={() => handleSimpleCommand(() => unpublishAction({ entityType, entityId }))}
            disabled={actionLoading}
            className="w-full py-1.5 px-3 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/50 rounded-lg transition-colors"
          >
            Unpublish to Draft
          </button>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsVisibilityOpen(true)}
            disabled={actionLoading}
            className="flex-1 py-1.5 px-2 text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 rounded-lg transition-colors"
          >
            Change Scope
          </button>

          {allowedCommands.includes('ARCHIVE') && (
            <button
              type="button"
              onClick={() => handleSimpleCommand(() => archivePublicationAction({ entityType, entityId }))}
              disabled={actionLoading}
              className="py-1.5 px-3 text-[11px] font-medium text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/50 rounded-lg transition-colors"
            >
              Archive
            </button>
          )}

          {allowedCommands.includes('RESTORE') && (
            <button
              type="button"
              onClick={() => handleSimpleCommand(() => restorePublicationAction({ entityType, entityId }))}
              disabled={actionLoading}
              className="flex-1 py-1.5 px-3 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/50 rounded-lg transition-colors"
            >
              Restore to Draft
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        entityType={entityType}
        entityId={entityId}
        entityTitle={entityTitle}
        currentScheduledAt={scheduledAt}
        onSuccess={handleRefresh}
      />

      <PublishConfirmModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        entityType={entityType}
        entityId={entityId}
        entityTitle={entityTitle}
        onSuccess={handleRefresh}
      />

      <ChangeVisibilityModal
        isOpen={isVisibilityOpen}
        onClose={() => setIsVisibilityOpen(false)}
        entityType={entityType}
        entityId={entityId}
        entityTitle={entityTitle}
        currentVisibility={visibility}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
