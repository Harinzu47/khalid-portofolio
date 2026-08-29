'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { getRelationshipHealthAction } from '@/actions/relationships';
import type { RelationshipHealthSummaryDTO } from '@/types/dtos';

interface RelationshipHealthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RelationshipHealthDrawer({
  isOpen,
  onClose,
}: RelationshipHealthDrawerProps) {
  const [data, setData] = useState<RelationshipHealthSummaryDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = () => {
    setLoading(true);
    getRelationshipHealthAction().then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-terminal-bg/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-terminal-surface-card border-l border-terminal-border h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-terminal-border bg-terminal-surface-bg/50">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-terminal-warning" />
            <div>
              <h3 className="font-semibold text-sm text-terminal-text-primary">
                Relationship Graph Diagnostics
              </h3>
              <p className="text-xs text-terminal-text-muted">
                Integrity analysis of semantic graph edges & endpoint references.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loading}
              className="p-1.5 rounded-lg border border-terminal-border text-terminal-text-muted hover:text-terminal-text-primary text-xs flex items-center gap-1 font-mono transition-colors"
              title="Re-run health check"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && !data ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs font-mono text-terminal-text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-terminal-secondary" />
              <span>Scanning graph integrity...</span>
            </div>
          ) : data ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-terminal-surface-bg border border-terminal-border rounded-lg">
                  <span className="text-terminal-text-muted text-[11px] block">ACTIVE EDGES</span>
                  <span className="text-lg font-bold text-terminal-text-primary">
                    {data.totalActive}
                  </span>
                </div>
                <div className="p-3 bg-terminal-surface-bg border border-terminal-border rounded-lg">
                  <span className="text-terminal-text-muted text-[11px] block">ARCHIVED EDGES</span>
                  <span className="text-lg font-bold text-terminal-text-muted">
                    {data.totalArchived}
                  </span>
                </div>
                <div
                  className={`p-3 border rounded-lg ${
                    data.totalIssues > 0
                      ? 'bg-terminal-warning/10 border-terminal-warning/30 text-terminal-warning'
                      : 'bg-terminal-success/10 border-terminal-success/30 text-terminal-success'
                  }`}
                >
                  <span className="text-[11px] block opacity-80">ISSUES FLAGGED</span>
                  <span className="text-lg font-bold">
                    {data.totalIssues}
                  </span>
                </div>
              </div>

              {/* Issues list */}
              {data.issues.length === 0 ? (
                <div className="p-6 border border-terminal-success/30 bg-terminal-success/5 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-terminal-success mx-auto" />
                  <h4 className="font-semibold text-sm text-terminal-text-primary">
                    All Relationship Edges Healthy
                  </h4>
                  <p className="text-xs text-terminal-text-muted max-w-sm mx-auto">
                    Zero missing endpoints, zero archived references, and all privacy configurations pass integrity rules.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-mono text-xs text-terminal-text-muted uppercase">
                    Detected Integrity Diagnostics ({data.issues.length})
                  </h4>
                  <div className="space-y-2.5">
                    {data.issues.map((issue, idx) => (
                      <div
                        key={`${issue.relationshipId}-${idx}`}
                        className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                          issue.severity === 'error'
                            ? 'bg-terminal-error/5 border-terminal-error/30'
                            : 'bg-terminal-warning/5 border-terminal-warning/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {issue.severity === 'error' ? (
                              <AlertCircle className="w-4 h-4 text-terminal-error shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-terminal-warning shrink-0" />
                            )}
                            <span className="font-mono font-semibold text-[11px] uppercase tracking-wider">
                              {issue.issueCode}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-terminal-text-muted">
                            Edge ID: {issue.relationshipId.slice(0, 8)}...
                          </span>
                        </div>

                        <p className="text-terminal-text-primary font-medium">
                          {issue.message}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] font-mono text-terminal-text-muted pt-1 border-t border-terminal-border/40">
                          <span>
                            SRC: {issue.source.entityType} ({issue.source.label || issue.source.id.slice(0, 8)})
                          </span>
                          <span>&rarr;</span>
                          <span>
                            TGT: {issue.target.entityType} ({issue.target.label || issue.target.id.slice(0, 8)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
