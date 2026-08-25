'use client';

import React, { useState, useTransition } from 'react';
import { upsertSocialLinkAction, deleteSocialLinkAction } from '@/actions/settings';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Share2, Plus, Trash2, Loader2, ExternalLink } from 'lucide-react';

interface SocialLinkItem {
  id: string;
  platform: string;
  label?: string | null;
  url: string;
  sortOrder: number;
  isVisible: boolean;
}

export function SocialLinksManager({ initialLinks }: { initialLinks: SocialLinkItem[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New link state
  const [platform, setPlatform] = useState('');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !url) return;
    setErrorMessage(null);

    startTransition(async () => {
      const res = await upsertSocialLinkAction({
        platform,
        label: label || undefined,
        url,
        sortOrder: links.length,
        isVisible: true,
      });

      if (res.success && res.data) {
        setLinks((prev) => [...prev, res.data as SocialLinkItem]);
        setPlatform('');
        setLabel('');
        setUrl('');
      } else {
        setErrorMessage(res.error || 'Failed to add social link.');
      }
    });
  };

  const handleDeleteLink = (id: string) => {
    startTransition(async () => {
      const res = await deleteSocialLinkAction(id);
      if (res.success) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
      } else {
        setErrorMessage(res.error || 'Failed to delete link.');
      }
    });
  };

  return (
    <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-6 font-mono">
      <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider flex items-center space-x-2">
        <Share2 className="w-4 h-4 text-terminal-secondary" />
        <span>Connected Channels & Social Platforms</span>
      </h2>

      {errorMessage && (
        <Alert variant="destructive" title="Action Error">
          {errorMessage}
        </Alert>
      )}

      {/* Existing Links List */}
      <div className="space-y-2">
        {links.length === 0 ? (
          <p className="text-xs text-terminal-text-muted">No external channels linked yet.</p>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-3 rounded bg-terminal-bg border border-terminal-border text-xs"
            >
              <div className="flex items-center space-x-3 truncate">
                <span className="font-bold text-terminal-primary capitalize">
                  {link.platform}
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terminal-text-secondary hover:text-terminal-text-primary truncate max-w-sm flex items-center space-x-1"
                >
                  <span className="truncate">{link.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteLink(link.id)}
                disabled={isPending}
                className="p-1 rounded text-terminal-text-muted hover:text-terminal-accent hover:bg-terminal-accent/10 transition-colors"
                title="Remove Channel"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Link Form */}
      <form onSubmit={handleAddLink} className="space-y-3 pt-4 border-t border-terminal-border">
        <h3 className="text-[11px] font-bold text-terminal-text-muted uppercase">
          Link New Channel
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Platform (e.g. GitHub, LinkedIn, X)"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            required
          />
          <Input
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Input
            placeholder="URL (https://...)"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="secondary" size="sm" disabled={isPending || !platform || !url}>
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <Plus className="w-3.5 h-3.5 mr-1" />
            )}
            <span>Add Channel</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
