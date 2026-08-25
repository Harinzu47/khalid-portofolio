'use client';

import React, { useState, useTransition } from 'react';
import { deleteSkillAction } from '@/actions/taxonomy';
import { Trash2, Loader2 } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export function DeleteSkillButton({
  skillId,
  skillName,
}: {
  skillId: string;
  skillName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const handleDelete = () => {
    startDelete(async () => {
      const res = await deleteSkillAction(skillId);
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
        title="Delete Skill"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Skill Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 font-mono text-xs">
          <p className="text-terminal-text-secondary">
            Are you sure you want to delete competency <strong className="text-terminal-text-primary">"{skillName}"</strong>?
          </p>
          <p className="text-[11px] text-terminal-text-muted">
            This will remove this skill tag across all linked portfolio projects.
          </p>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded text-xs font-mono font-semibold bg-terminal-accent text-white hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center space-x-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Confirm Delete</span>
              )}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
