'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  FileText,
  Search,
  Grid,
  List,
  Activity,
  Archive,
  Layers,
  Filter,
  Globe,
  Lock,
} from 'lucide-react';
import { MediaCard } from './MediaCard';
import { MediaUploader } from './MediaUploader';
import { MediaMetadataModal } from '@/components/admin/media/MediaMetadataModal';
import { MediaHealthDrawer } from '@/components/admin/media/MediaHealthDrawer';
import type { MediaListItemDTO } from '@/types/dtos/media.dto';
import type { MediaKind } from '@/domain/media';

interface MediaConsoleClientProps {
  initialMedia: MediaListItemDTO[];
  totalRecords: number;
}

export function MediaConsoleClient({ initialMedia, totalRecords: initialTotal }: MediaConsoleClientProps) {
  const [mediaList, setMediaList] = useState<MediaListItemDTO[]>(initialMedia);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'IMAGE' | 'DOCUMENT' | 'ARCHIVED'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<MediaListItemDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHealthDrawerOpen, setIsHealthDrawerOpen] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '60',
      });

      if (activeTab === 'ARCHIVED') {
        params.set('archived', 'archived');
      } else {
        params.set('archived', 'active');
        if (activeTab === 'IMAGE' || activeTab === 'DOCUMENT') {
          params.set('mediaKind', activeTab);
        }
      }

      if (search.trim()) {
        params.set('search', search.trim());
      }

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setMediaList(json.data || []);
        setTotal(json.total || 0);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [activeTab, search]);

  const handleOpenDetails = (item: MediaListItemDTO) => {
    setSelectedMedia(item);
    setIsModalOpen(true);
  };

  const handleSelectFromHealth = (mediaId: string) => {
    const item = mediaList.find((m) => m.id === mediaId);
    if (item) {
      setSelectedMedia(item);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-terminal-text-primary flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-terminal-primary" />
            <span>Media & Asset Library</span>
          </h1>
          <p className="text-xs text-terminal-text-secondary mt-1">
            Canonical owner-isolated storage registry for diagrams, project screenshots, and credential proofs.
          </p>
        </div>

        <button
          onClick={() => setIsHealthDrawerOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-terminal-surface border border-terminal-border hover:border-terminal-primary/50 text-terminal-text-primary hover:text-terminal-primary transition-all flex items-center space-x-2 text-xs font-bold shrink-0 self-start sm:self-auto shadow-sm"
        >
          <Activity className="w-4 h-4 text-terminal-primary" />
          <span>Health Diagnostics</span>
        </button>
      </div>

      {/* Upload Zone */}
      <MediaUploader onUploadSuccess={fetchMedia} />

      {/* Filter & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-terminal-surface border border-terminal-border rounded-xl">
        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'ALL', label: 'All Assets' },
            { id: 'IMAGE', label: 'Images' },
            { id: 'DOCUMENT', label: 'Documents' },
            { id: 'ARCHIVED', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-terminal-primary/10 text-terminal-primary border border-terminal-primary'
                  : 'text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-terminal-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename or alt text..."
              className="w-full pl-8 pr-3 py-1.5 bg-terminal-bg border border-terminal-border rounded-lg text-xs text-terminal-text-primary placeholder:text-terminal-text-muted focus:border-terminal-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center border border-terminal-border rounded-lg overflow-hidden bg-terminal-bg shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-terminal-primary/20 text-terminal-primary'
                  : 'text-terminal-text-muted hover:text-terminal-text-primary'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-terminal-primary/20 text-terminal-primary'
                  : 'text-terminal-text-muted hover:text-terminal-text-primary'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-terminal-text-muted">
          <span>Assets Found ({total})</span>
        </div>

        {loading ? (
          <div className="p-16 text-center border border-terminal-border rounded-xl bg-terminal-surface text-xs text-terminal-text-muted">
            Filtering assets...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="p-16 text-center border border-terminal-border rounded-xl bg-terminal-surface text-xs text-terminal-text-muted space-y-2">
            <p>No media files match the current filter.</p>
            <p className="text-[11px]">Upload new images or documents using the upload box above.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaList.map((asset) => (
              <MediaCard
                key={asset.id}
                media={asset}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-terminal-border bg-terminal-surface overflow-hidden divide-y divide-terminal-border text-xs">
            {mediaList.map((asset) => (
              <div
                key={asset.id}
                onClick={() => handleOpenDetails(asset)}
                className="p-3.5 flex items-center justify-between hover:bg-terminal-surface-hover cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-10 h-10 rounded bg-terminal-bg border border-terminal-border flex items-center justify-center shrink-0 overflow-hidden">
                    {asset.mimeType.startsWith('image/') ? (
                      <img src={asset.deliveryUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-terminal-text-muted" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-terminal-text-primary truncate" title={asset.originalName}>
                      {asset.originalName}
                    </div>
                    <div className="text-[11px] text-terminal-text-muted flex items-center space-x-2">
                      <span>{asset.mimeType}</span>
                      <span>&bull;</span>
                      <span>{(asset.sizeBytes / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asset.visibility === 'public'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {asset.visibility.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-terminal-bg border border-terminal-border text-[10px] text-terminal-text-muted">
                    {asset.usageCount} ref{asset.usageCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata / Details Modal */}
      <MediaMetadataModal
        media={selectedMedia}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdated={fetchMedia}
      />

      {/* Health Diagnostics Drawer */}
      <MediaHealthDrawer
        isOpen={isHealthDrawerOpen}
        onClose={() => setIsHealthDrawerOpen(false)}
        onSelectMedia={handleSelectFromHealth}
      />
    </div>
  );
}
