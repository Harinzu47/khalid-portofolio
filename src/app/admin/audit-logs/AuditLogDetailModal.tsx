'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Eye, Code } from 'lucide-react';

interface AuditLogDetailModalProps {
  log: {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    actorId?: string | null;
    oldValues?: unknown;
    newValues?: unknown;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
  };
}

export function AuditLogDetailModal({ log }: AuditLogDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
        title="Inspect Audit Payload"
      >
        <Eye className="w-4 h-4" />
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Audit Payload: ${log.action} on ${log.entityType}`}
        maxWidth="lg"
      >
        <div className="space-y-4 font-mono text-xs max-h-[70vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded bg-terminal-bg border border-terminal-border text-[11px]">
            <div>
              <span className="text-terminal-text-muted">Event ID:</span>{' '}
              <span className="text-terminal-text-primary">{log.id}</span>
            </div>
            <div>
              <span className="text-terminal-text-muted">Timestamp:</span>{' '}
              <span className="text-terminal-text-primary">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-terminal-text-muted">Entity Target:</span>{' '}
              <span className="text-terminal-text-primary">
                {log.entityType} ({log.entityId})
              </span>
            </div>
            <div>
              <span className="text-terminal-text-muted">Actor ID:</span>{' '}
              <span className="text-terminal-text-primary">{log.actorId || 'system / anonymous'}</span>
            </div>
          </div>

          {/* Old vs New Values Payloads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Old Values */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-terminal-accent font-semibold text-[11px]">
                <Code className="w-3.5 h-3.5" />
                <span>Previous State (old_values)</span>
              </div>
              <pre className="p-3 rounded bg-terminal-bg border border-terminal-border text-[11px] overflow-x-auto text-terminal-text-secondary leading-relaxed max-h-60">
                {log.oldValues
                  ? JSON.stringify(log.oldValues, null, 2)
                  : '<no prior state / insert>'}
              </pre>
            </div>

            {/* New Values */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-terminal-primary font-semibold text-[11px]">
                <Code className="w-3.5 h-3.5" />
                <span>Applied State (new_values)</span>
              </div>
              <pre className="p-3 rounded bg-terminal-bg border border-terminal-border text-[11px] overflow-x-auto text-terminal-text-primary leading-relaxed max-h-60">
                {log.newValues
                  ? JSON.stringify(log.newValues, null, 2)
                  : '<state removed / deletion>'}
              </pre>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
