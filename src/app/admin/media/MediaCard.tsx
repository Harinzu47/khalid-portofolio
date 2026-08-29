'use client';

import React, { useState } from 'react';
import { FileText, Copy, Check, ExternalLink, Globe, Lock, EyeOff, Layers, Archive } from 'lucide-react';
import type { MediaListItemDTO } from '@/types/dtos/media.dto';

interface MediaCardProps {
  media: MediaListItemDTO;
  onOpenDetails: (media: MediaListItemDTO) => void;
}

export function MediaCard({ media, onOpenDetails }: MediaCardProps) {
  const [copied, setCopied] = useState(false);

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(media.deliveryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isImage = media.mimeType.startsWith('image/');
  const formattedSize =
    media.sizeBytes > 1024 * 1024
      ? `${(media.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(media.sizeBytes / 1024)} KB`;

  return (
    <div
      onClick={() => onOpenDetails(media)}
      className="group relative rounded-xl border border-terminal-border bg-terminal-surface hover:border-terminal-primary/50 transition-all flex flex-col justify-between overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
    >
      {/* Media Preview Box */}
      <div className="relative aspect-video w-full bg-terminal-bg flex items-center justify-center border-b border-terminal-border overflow-hidden">
        {isImage ? (
          <img
            src={media.deliveryUrl}
            alt={media.altText || media.originalName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <FileText className="w-10 h-10 text-terminal-text-muted" />
        )}

        {/* Visibility & Archive Badges */}
        <div className="absolute top-2 left-2 flex items-center space-x-1.5">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow ${
              media.visibility === 'public'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : media.visibility === 'unlisted'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700'
            }`}
          >
            {media.visibility === 'public' && <Globe className="w-2.5 h-2.5" />}
            {media.visibility === 'unlisted' && <EyeOff className="w-2.5 h-2.5" />}
            {media.visibility === 'private' && <Lock className="w-2.5 h-2.5" />}
            <span className="capitalize">{media.visibility}</span>
          </span>

          {media.archivedAt && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center space-x-1 shadow">
              <Archive className="w-2.5 h-2.5" />
              <span>Archived</span>
            </span>
          )}
        </div>

        {/* Quick Action Overlay */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={copyUrl}
            className="p-1.5 rounded bg-terminal-bg/80 backdrop-blur-sm text-terminal-text-muted hover:text-terminal-primary transition-colors border border-terminal-border"
            title="Copy Delivery URL"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-terminal-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <a
            href={media.deliveryUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded bg-terminal-bg/80 backdrop-blur-sm text-terminal-text-muted hover:text-terminal-text-primary transition-colors border border-terminal-border"
            title="Open delivery URL"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Usage Count Badge */}
        <div className="absolute bottom-2 right-2">
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border shadow ${
              media.usageCount > 0
                ? 'bg-terminal-primary/20 text-terminal-primary border-terminal-primary/40'
                : 'bg-zinc-800/80 text-zinc-400 border-zinc-700'
            }`}
          >
            {media.usageCount > 0 ? `${media.usageCount} ref${media.usageCount > 1 ? 's' : ''}` : 'Unused'}
          </span>
        </div>
      </div>

      {/* Media Details */}
      <div className="p-3.5 space-y-1.5">
        <div
          className="font-mono text-xs font-semibold text-terminal-text-primary truncate"
          title={media.originalName}
        >
          {media.originalName}
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-terminal-text-muted">
          <span>{media.mimeType.split('/')[1]?.toUpperCase() || media.mimeType}</span>
          <span>{formattedSize}</span>
        </div>
        {media.altText && (
          <div className="text-[10px] font-mono text-terminal-text-secondary truncate italic">
            &ldquo;{media.altText}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
