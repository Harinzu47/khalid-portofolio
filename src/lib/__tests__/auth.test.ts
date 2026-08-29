import { describe, it, expect, vi } from 'vitest';
import { requireOwnerSession, requireAuth } from '../auth';

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
