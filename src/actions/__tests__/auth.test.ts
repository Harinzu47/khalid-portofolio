import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loginAction } from '../auth';
import { limitLogin } from '@/lib/login-rate-limit';

const auth = vi.hoisted(() => ({ signInWithPassword: vi.fn(), signOut: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn(async () => ({ auth })) }));
vi.mock('@/lib/login-rate-limit', () => ({ limitLogin: vi.fn() }));
vi.mock('next/headers', () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('Login security boundary', () => {
  beforeEach(() => {
    vi.stubEnv('OWNER_USER_ID', 'owner');
    vi.clearAllMocks();
    vi.mocked(limitLogin).mockResolvedValue({ success: true, resetSeconds: 60 });
    auth.signOut.mockResolvedValue({ error: null });
  });
  afterEach(() => vi.unstubAllEnvs());
  const credentials = { email: 'owner@example.com', password: 'password123' };

  it('rejects and signs out a successfully authenticated non-owner', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'other' } }, error: null });
    expect(await loginAction(credentials)).toMatchObject({ success: false, error: 'Invalid email or password.' });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('allows the configured owner to proceed', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'owner' } }, error: null });
    await expect(loginAction(credentials)).rejects.toThrow('NEXT_REDIRECT');
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it('does not authenticate when the shared limiter rejects the client', async () => {
    vi.mocked(limitLogin).mockResolvedValue({ success: false, resetSeconds: 20 });
    expect(await loginAction(credentials)).toMatchObject({ success: false });
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('fails closed without exposing storage errors', async () => {
    vi.mocked(limitLogin).mockRejectedValue(new Error('sensitive database detail'));
    const result = await loginAction(credentials);
    expect(result).toMatchObject({ success: false });
    expect(JSON.stringify(result)).not.toContain('sensitive');
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });
});
