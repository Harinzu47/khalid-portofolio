import { MediaService } from '@/services/media.service';
import { MediaCard } from './MediaCard';
import { MediaUploader } from './MediaUploader';
import { Image as ImageIcon } from 'lucide-react';

export default async function AdminMediaPage() {
  const result = await MediaService.getMedia({ page: 1, pageSize: 60 });
  const mediaList = result.data;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-terminal-primary" />
            <span>Media Library & Assets</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Manage diagram assets, architecture schematics, project banners, and credential proofs stored in Supabase.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <MediaUploader />

      {/* Media Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-terminal-text-muted">
          <span>Uploaded Assets ({result.meta.totalRecords})</span>
        </div>

        {mediaList.length === 0 ? (
          <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-2">
            <p>No media files uploaded yet.</p>
            <p className="text-[11px]">Upload images, architecture diagrams, or credential PDFs above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaList.map((asset) => (
              <MediaCard key={asset.id} media={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
