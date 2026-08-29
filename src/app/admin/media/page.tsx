import { requireOwnerSession } from '@/lib/auth';
import { MediaService } from '@/services/media.service';
import { MediaConsoleClient } from './MediaConsoleClient';

export default async function AdminMediaPage() {
  const session = await requireOwnerSession('/admin/media');
  const result = await MediaService.getAdminMedia(session.userId, { page: 1, limit: 60, archived: 'active' });

  return (
    <MediaConsoleClient
      initialMedia={result.data}
      totalRecords={result.total}
    />
  );
}
