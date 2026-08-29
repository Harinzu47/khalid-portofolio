'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  RefreshCw,
  FileQuestion,
  Image as ImageIcon,
  Archive,
} from 'lucide-react';
import { getMediaHealthDiagnosticsAction } from '@/actions/media';
import type { MediaHealthSummaryDTO } from '@/types/dtos/media.dto';

interface MediaHealthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia?: (mediaId: string) => void;
}

export function MediaHealthDrawer({ isOpen, onClose, onSelectMedia }: MediaHealthDrawerProps) {
  const [diagnostics, setDiagnostics] = useState<MediaHealthSummaryDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    const res = await getMediaHealthDiagnosticsAction();
    setLoading(false);
    if (res.success && res.data) {
      setDiagnostics(res.data);
    } else {
      setError(res.error || 'Failed to run diagnostics.');
    }
  };

  React.useEffect(() => {
    if (isOpen && !diagnostics) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-terminal-bg/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-terminal-surface border-l border-terminal-border h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-terminal-border bg-terminal-bg/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-terminal-primary" />
            <h2 className="text-sm font-bold font-mono text-terminal-text-primary">
              Media Health Diagnostics
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-surface-hover transition-colors"
              title="Re-run Diagnostics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 font-mono text-xs">
          {error && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-terminal-text-muted space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-terminal-primary" />
              <p>Inspecting storage assets & references...</p>
            </div>
          ) : diagnostics ? (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-terminal-bg border border-terminal-border space-y-1">
                  <span className="text-[10px] text-terminal-text-muted">Total Assets</span>
                  <div className="text-lg font-bold text-terminal-text-primary">
                    {diagnostics.totalAssets}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-terminal-bg border border-terminal-border space-y-1">
                  <span className="text-[10px] text-terminal-text-muted">Unused (Staged)</span>
                  <div className="text-lg font-bold text-blue-400">
                    {diagnostics.unusedAssetsCount}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-terminal-bg border border-terminal-border space-y-1">
                  <span className="text-[10px] text-terminal-text-muted">Missing Alt Text</span>
                  <div className="text-lg font-bold text-yellow-400">
                    {diagnostics.missingAltTextCount}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-terminal-bg border border-terminal-border space-y-1">
                  <span className="text-[10px] text-terminal-text-muted">Archived Referenced</span>
                  <div className="text-lg font-bold text-red-400">
                    {diagnostics.archivedReferencedCount}
                  </div>
                </div>
              </div>

              {/* Issues List */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-terminal-text-primary">
                  Diagnostic Findings ({diagnostics.issues.length})
                </h3>

                {diagnostics.issues.length === 0 ? (
                  <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>All media assets and references are healthy.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {diagnostics.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectMedia && onSelectMedia(issue.mediaId)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          issue.severity === 'error'
                            ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/60'
                            : issue.severity === 'warning'
                            ? 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/60'
                            : 'bg-blue-500/5 border-blue-500/30 hover:border-blue-500/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1.5">
                            {issue.severity === 'error' && (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            )}
                            {issue.severity === 'warning' && (
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                            )}
                            {issue.severity === 'info' && (
                              <Info className="w-3.5 h-3.5 text-blue-400" />
                            )}
                            <span className="font-bold text-[10px] uppercase">
                              {issue.code.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span className="text-[10px] text-terminal-text-muted">Inspect &rarr;</span>
                        </div>
                        <p className="text-terminal-text-secondary text-[11px] leading-relaxed">
                          {issue.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
