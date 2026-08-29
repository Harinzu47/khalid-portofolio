'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Upload,
  Check,
  FileText,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { uploadMediaAction } from '@/actions/media';
import type { MediaListItemDTO } from '@/types/dtos/media.dto';
import type { MediaKind } from '@/domain/media';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaListItemDTO) => void;
  selectedMediaId?: string | null;
  allowedKinds?: MediaKind[];
  title?: string;
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  selectedMediaId,
  allowedKinds = ['IMAGE'],
  title = 'Select Media Asset',
}: MediaPickerProps) {
  const [mediaList, setMediaList] = useState<MediaListItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        archived: 'active',
        limit: '60',
      });
      if (allowedKinds.length === 1) {
        params.set('mediaKind', allowedKinds[0]);
      }
      if (search.trim()) {
        params.set('search', search.trim());
      }

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setMediaList(json.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', 'public');

    const res = await uploadMediaAction(formData);
    setUploading(false);

    if (res.success && res.data) {
      // Auto select newly uploaded media
      const item: MediaListItemDTO = {
        id: res.data.id,
        originalName: res.data.originalName,
        mimeType: res.data.mimeType,
        mediaKind: res.data.mediaKind,
        sizeBytes: res.data.sizeBytes,
        width: res.data.width,
        height: res.data.height,
        altText: res.data.altText,
        caption: res.data.caption,
        visibility: res.data.visibility,
        usageCount: 0,
        deliveryUrl: res.data.deliveryUrl,
        archivedAt: null,
        createdAt: res.data.createdAt,
        updatedAt: res.data.updatedAt,
      };
      onSelect(item);
      onClose();
    } else {
      setUploadError(res.error || 'Failed to upload asset.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-terminal-bg/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-terminal-surface border border-terminal-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-terminal-border bg-terminal-bg/50">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-terminal-primary" />
            <h2 className="text-sm font-bold font-mono text-terminal-text-primary">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-terminal-border bg-terminal-bg/30 font-mono text-xs">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'library'
                  ? 'bg-terminal-primary/10 text-terminal-primary border border-terminal-primary font-bold'
                  : 'text-terminal-text-muted hover:text-terminal-text-primary'
              }`}
            >
              Media Library
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'upload'
                  ? 'bg-terminal-primary/10 text-terminal-primary border border-terminal-primary font-bold'
                  : 'text-terminal-text-muted hover:text-terminal-text-primary'
              }`}
            >
              Upload Asset
            </button>
          </div>

          {activeTab === 'library' && (
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-terminal-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-8 pr-3 py-1.5 bg-terminal-bg border border-terminal-border rounded-lg text-xs font-mono text-terminal-text-primary placeholder:text-terminal-text-muted focus:border-terminal-primary focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono">
          {activeTab === 'library' ? (
            loading ? (
              <div className="p-12 text-center text-terminal-text-muted text-xs">
                Loading assets...
              </div>
            ) : mediaList.length === 0 ? (
              <div className="p-12 text-center text-terminal-text-muted text-xs space-y-2">
                <p>No eligible media assets found.</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-3 py-1.5 rounded bg-terminal-primary text-terminal-bg font-bold"
                >
                  Upload New Asset
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaList.map((asset) => {
                  const isSelected = selectedMediaId === asset.id;
                  const isImage = asset.mimeType.startsWith('image/');
                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        onSelect(asset);
                        onClose();
                      }}
                      className={`group relative rounded-lg border bg-terminal-bg overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-terminal-primary ring-2 ring-terminal-primary/30'
                          : 'border-terminal-border hover:border-terminal-primary/50'
                      }`}
                    >
                      <div className="aspect-video w-full flex items-center justify-center overflow-hidden bg-terminal-surface">
                        {isImage ? (
                          <img
                            src={asset.deliveryUrl}
                            alt={asset.altText || asset.originalName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <FileText className="w-8 h-8 text-terminal-text-muted" />
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-terminal-primary text-terminal-bg shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-terminal-border/50 text-[11px] truncate" title={asset.originalName}>
                        {asset.originalName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="p-8 border-2 border-dashed border-terminal-border rounded-xl text-center space-y-4 bg-terminal-bg/40">
              <Upload className="w-10 h-10 text-terminal-primary mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-terminal-text-primary">
                  Choose a file to upload
                </p>
                <p className="text-[11px] text-terminal-text-muted">
                  Supported formats: JPEG, PNG, WebP, GIF, PDF (up to 10MB/25MB)
                </p>
              </div>

              {uploadError && (
                <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {uploadError}
                </div>
              )}

              <label className="inline-block px-4 py-2 rounded-lg bg-terminal-primary text-terminal-bg font-bold cursor-pointer hover:bg-terminal-primary/90 transition-colors text-xs">
                {uploading ? 'Uploading...' : 'Browse File'}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
