'use client';

import React, { useState, useTransition } from 'react';
import { archiveNoteAction } from '@/actions/notes';
import { Archive, Loader2 } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export function ArchiveNoteButton({
  noteId,
  noteTitle,
}: {
  noteId: string;
  noteTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isArchiving, startArchive] = useTransition();

  const handleArchive = () => {
    startArchive(async () => {
      const res = await archiveNoteAction(noteId);
      if (res && res.success) {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-accent hover:bg-terminal-accent/10 transition-colors"
        title="Archive Tech Note"
      >
        <Archive className="w-4 h-4" />
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Soft Archive"
        maxWidth="sm"
      >
        <div className="space-y-4 font-mono text-xs">
          <p className="text-terminal-text-secondary">
            Are you sure you want to archive <strong className="text-terminal-text-primary">"{noteTitle}"</strong>?
          </p>
          <p className="text-[11px] text-terminal-text-muted">
            The note will be soft-archived and removed from public listings immediately.
          </p>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isArchiving}
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={isArchiving}
              className="px-3 py-1.5 rounded text-xs font-mono font-semibold bg-terminal-accent text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center space-x-1"
            >
              {isArchiving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Archiving...</span>
                </>
              ) : (
                <span>Confirm Archive</span>
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export const DeleteNoteButton = ArchiveNoteButton;
