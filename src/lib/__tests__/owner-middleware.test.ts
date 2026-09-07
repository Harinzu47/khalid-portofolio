import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { updateSession } from '../supabase/middleware';

const auth = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock('@supabase/ssr', () => ({ createServerClient: vi.fn(() => ({ auth })) }));

describe('Private route authorization', () => {
  beforeEach(() => {
    vi.stubEnv('OWNER_USER_ID', 'owner');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test');
    auth.getUser.mockResolvedValue({ data: { user: { id: 'other' } }, error: null });
  });
  afterEach(() => vi.unstubAllEnvs());

  it.each(['/admin/settings', '/os/settings', '/api/admin/media'])(
    'denies a non-owner at %s', async (path) => {
      const response = await updateSession(new NextRequest(`https://example.com${path}`));
      expect(response.status).toBe(403);
    },
  );

  it('does not redirect a non-owner from login back to the admin console', async () => {
    const response = await updateSession(new NextRequest('https://example.com/login'));
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows the configured owner into the console', async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: 'owner' } }, error: null });
    expect((await updateSession(new NextRequest('https://example.com/admin'))).status).toBe(200);
  });
});
