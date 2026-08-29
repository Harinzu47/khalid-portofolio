'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Archive,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Layers,
  Globe,
  Lock,
  EyeOff,
} from 'lucide-react';
import {
  updateMediaMetadataAction,
  archiveMediaAction,
  restoreMediaAction,
  deleteMediaPermanentlyAction,
  getMediaUsageAction,
} from '@/actions/media';
import type { MediaListItemDTO, MediaUsageDTO } from '@/types/dtos/media.dto';

interface MediaMetadataModalProps {
  media: MediaListItemDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function MediaMetadataModal({
  media,
  isOpen,
  onClose,
  onUpdated,
}: MediaMetadataModalProps) {
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<MediaUsageDTO | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (media) {
      setAltText(media.altText || '');
      setCaption(media.caption || '');
      setVisibility(media.visibility);
      setError(null);
      setConfirmDelete(false);

      // Load structural usage
      setLoadingUsage(true);
      getMediaUsageAction(media.id)
        .then((res) => {
          if (res.success && res.data) {
            setUsage(res.data);
          }
        })
        .finally(() => setLoadingUsage(false));
    }
  }, [media]);

  if (!isOpen || !media) return null;

  const isImage = media.mimeType.startsWith('image/');
  const formattedSize =
    media.sizeBytes > 1024 * 1024
      ? `${(media.sizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(media.sizeBytes / 1024)} KB`;

  const copyUrl = () => {
    navigator.clipboard.writeText(media.deliveryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await updateMediaMetadataAction({
      mediaId: media.id,
      altText: altText.trim() || null,
      caption: caption.trim() || null,
      visibility,
    });

    setLoading(false);
    if (res.success) {
      onUpdated();
      onClose();
    } else {
      setError(res.error || 'Failed to update metadata.');
    }
  };

  const handleArchiveToggle = async () => {
    setLoading(true);
    setError(null);

    const res = media.archivedAt
      ? await restoreMediaAction(media.id)
      : await archiveMediaAction(media.id);

    setLoading(false);
    if (res.success) {
      onUpdated();
      onClose();
    } else {
      setError(res.error || 'Failed to change archive state.');
    }
  };

  const handleDeletePermanent = async () => {
    setLoading(true);
    setError(null);

    const res = await deleteMediaPermanentlyAction(media.id);
    setLoading(false);
    if (res.success) {
      onUpdated();
      onClose();
    } else {
      setError(res.error || 'Failed to delete media permanently.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-terminal-bg/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-terminal-surface border border-terminal-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-terminal-border bg-terminal-bg/50">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-terminal-primary" />
            <h2 className="text-sm font-bold font-mono text-terminal-text-primary">
              Asset Metadata & Usage
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-mono text-red-400 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Media Preview & Technical Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative aspect-video rounded-lg border border-terminal-border bg-terminal-bg overflow-hidden flex items-center justify-center">
              {isImage ? (
                <img
                  src={media.deliveryUrl}
                  alt={media.altText || media.originalName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center space-y-2 text-terminal-text-muted">
                  <FileText className="w-12 h-12" />
                  <span className="text-[11px] font-mono">{media.mimeType}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 font-mono text-xs text-terminal-text-secondary bg-terminal-bg/40 p-3.5 rounded-lg border border-terminal-border">
              <div className="flex justify-between py-1 border-b border-terminal-border/50">
                <span className="text-terminal-text-muted">Filename:</span>
                <span className="font-semibold text-terminal-text-primary truncate max-w-[150px]" title={media.originalName}>
                  {media.originalName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-terminal-border/50">
                <span className="text-terminal-text-muted">Size:</span>
                <span>{formattedSize}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-terminal-border/50">
                <span className="text-terminal-text-muted">MIME Type:</span>
                <span>{media.mimeType}</span>
              </div>
              {media.width && media.height && (
                <div className="flex justify-between py-1 border-b border-terminal-border/50">
                  <span className="text-terminal-text-muted">Dimensions:</span>
                  <span>{media.width} x {media.height} px</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-terminal-text-muted">Uploaded:</span>
                <span>{new Date(media.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-terminal-text-muted mb-1">
                Alt Text (Accessibility)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe image content for screen readers and SEO..."
                className="w-full px-3 py-2 rounded-lg bg-terminal-bg border border-terminal-border text-terminal-text-primary focus:border-terminal-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-terminal-text-muted mb-1">Caption / Description</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                placeholder="Optional caption or asset notes..."
                className="w-full px-3 py-2 rounded-lg bg-terminal-bg border border-terminal-border text-terminal-text-primary focus:border-terminal-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-terminal-text-muted mb-1">Delivery Visibility</label>
              <div className="grid grid-cols-3 gap-2">
                {(['private', 'unlisted', 'public'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={`px-3 py-2 rounded-lg border flex items-center justify-center space-x-1.5 transition-colors ${
                      visibility === v
                        ? 'border-terminal-primary bg-terminal-primary/10 text-terminal-primary font-bold'
                        : 'border-terminal-border bg-terminal-bg text-terminal-text-muted hover:text-terminal-text-primary'
                    }`}
                  >
                    {v === 'public' && <Globe className="w-3.5 h-3.5" />}
                    {v === 'unlisted' && <EyeOff className="w-3.5 h-3.5" />}
                    {v === 'private' && <Lock className="w-3.5 h-3.5" />}
                    <span className="capitalize">{v}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Usage References Section */}
            <div className="space-y-2 pt-2">
              <label className="block text-terminal-text-muted">
                Structural References ({usage ? usage.totalReferences : '...'})
              </label>
              {loadingUsage ? (
                <div className="p-3 bg-terminal-bg rounded border border-terminal-border text-terminal-text-muted text-center">
                  Scanning references...
                </div>
              ) : usage && usage.references.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {usage.references.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-terminal-bg border border-terminal-border flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-[10px] font-bold">
                          {ref.entityType}
                        </span>
                        <span className="font-semibold text-terminal-text-primary">
                          {ref.title}
                        </span>
                        <span className="text-terminal-text-muted">({ref.role})</span>
                      </div>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] ${
                          ref.isPublished
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}
                      >
                        {ref.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-terminal-bg rounded border border-terminal-border text-terminal-text-muted text-center">
                  No entities currently reference this asset (Unused).
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-terminal-border">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={copyUrl}
                  className="px-3 py-2 rounded-lg bg-terminal-bg border border-terminal-border text-terminal-text-muted hover:text-terminal-primary flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-terminal-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy URL'}</span>
                </button>

                <a
                  href={media.deliveryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-terminal-bg border border-terminal-border text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
                  title="Open Delivery URL"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleArchiveToggle}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-terminal-bg border border-terminal-border text-terminal-text-muted hover:text-yellow-400 flex items-center space-x-1.5 transition-colors"
                >
                  {media.archivedAt ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  <span>{media.archivedAt ? 'Restore' : 'Archive'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {media.archivedAt && usage?.totalReferences === 0 && (
                  confirmDelete ? (
                    <button
                      type="button"
                      onClick={handleDeletePermanent}
                      disabled={loading}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                    >
                      Confirm Permanent Delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center space-x-1.5 transition-colors"
                      title="Permanent Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanent Delete</span>
                    </button>
                  )
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-terminal-primary text-terminal-bg font-bold hover:bg-terminal-primary/90 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Metadata'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
