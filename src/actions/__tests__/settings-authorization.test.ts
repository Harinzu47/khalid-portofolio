import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportDatabaseBackupAction, updateProfileAction } from '../settings';
import { SettingsService } from '@/services/settings.service';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'outsider' } }, error: null })) },
  })),
}));
vi.mock('@/services/settings.service', () => ({
  SettingsService: { exportFullDatabase: vi.fn(), updateOperatorProfile: vi.fn() },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('Sensitive settings actions', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('denies direct backup and profile actions before touching the database', async () => {
    vi.stubEnv('OWNER_USER_ID', 'owner');
    await expect(exportDatabaseBackupAction()).rejects.toMatchObject({ statusCode: 403 });
    await expect(updateProfileAction({})).rejects.toMatchObject({ statusCode: 403 });
    expect(SettingsService.exportFullDatabase).not.toHaveBeenCalled();
    expect(SettingsService.updateOperatorProfile).not.toHaveBeenCalled();
  });
});
