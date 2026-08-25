'use client';

import React, { useState } from 'react';
import { DeleteMediaButton } from './DeleteMediaButton';
import { FileText, Copy, Check, ExternalLink } from 'lucide-react';

interface MediaCardProps {
  media: {
    id: string;
    originalName: string;
    path: string;
    mimeType: string;
    sizeBytes: number;
    altText?: string | null;
  };
}

export function MediaCard({ media }: MediaCardProps) {
  const [copied, setCopied] = useState(false);

  const publicUrl = `/media/${media.path}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isImage = media.mimeType.startsWith('image/');
  const formattedSize =
    media.sizeBytes > 1024 * 1024
      ? `${(media.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(media.sizeBytes / 1024)} KB`;

  return (
    <div className="group relative rounded-lg border border-terminal-border bg-terminal-surface hover:border-terminal-primary/50 transition-all flex flex-col justify-between overflow-hidden">
      {/* Media Preview Box */}
      <div className="relative aspect-video w-full bg-terminal-bg flex items-center justify-center border-b border-terminal-border overflow-hidden">
        {isImage ? (
          <img
            src={publicUrl}
            alt={media.altText || media.originalName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <FileText className="w-10 h-10 text-terminal-text-muted" />
        )}

        {/* Action Overlay */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={copyUrl}
            className="p-1.5 rounded bg-terminal-bg/80 text-terminal-text-muted hover:text-terminal-primary transition-colors"
            title="Copy Path"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-terminal-primary" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded bg-terminal-bg/80 text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <DeleteMediaButton mediaId={media.id} filename={media.originalName} />
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
      </div>
    </div>
  );
}
