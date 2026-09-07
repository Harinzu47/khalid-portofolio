import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requireOwnerSession, requireAuth } from '../auth';
import { createClient } from '../supabase/server';

vi.mock('../supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'owner-uuid-123',
            email: 'harinzu47@gmail.com',
          },
        },
        error: null,
      }),
    },
  }),
}));

describe('Owner Authorization Boundary', () => {
  beforeEach(() => vi.stubEnv('OWNER_USER_ID', 'owner-uuid-123'));
  afterEach(() => vi.unstubAllEnvs());

  it('rejects another authenticated account through both guard names', async () => {
    vi.stubEnv('OWNER_USER_ID', 'different-owner');
    await expect(requireAuth()).rejects.toMatchObject({ statusCode: 403 });
    await expect(requireOwnerSession()).rejects.toMatchObject({ statusCode: 403 });
  });

  it('fails closed when owner configuration is absent', async () => {
    vi.stubEnv('OWNER_USER_ID', '');
    await expect(requireAuth()).rejects.toMatchObject({ statusCode: 403 });
  });

  it('redirects unauthenticated requests', async () => {
    const client = await createClient();
    vi.mocked(client.auth.getUser).mockResolvedValueOnce({ data: { user: null }, error: null } as never);
    await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT');
  });
  it('resolves authenticated owner session with user ID and email', async () => {
    const session = await requireOwnerSession('/os');
    expect(session).toBeDefined();
    expect(session.userId).toBe('owner-uuid-123');
    expect(session.email).toBe('harinzu47@gmail.com');
  });

  it('verifies requireOwnerSession is an exact alias of requireAuth', async () => {
    const authSession = await requireAuth();
    const ownerSession = await requireOwnerSession();
    expect(authSession).toEqual(ownerSession);
  });
});
