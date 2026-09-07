import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/db/client';
import { limitLogin, loginClientKey } from '../login-rate-limit';

vi.mock('@/db/client', () => ({ db: { execute: vi.fn() } }));

describe('Login client isolation', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('LOGIN_CLIENT_IP_HEADER', 'x-login-client-ip');
    vi.mocked(db.execute).mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('uses separate opaque keys for different trusted clients', () => {
    const a = loginClientKey(new Headers({ 'x-login-client-ip': '192.0.2.1' }));
    const b = loginClientKey(new Headers({ 'x-login-client-ip': '192.0.2.2' }));
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('ignores caller-controlled forwarded headers', () => {
    const trusted = { 'x-login-client-ip': '192.0.2.1' };
    expect(loginClientKey(new Headers({ ...trusted, 'x-forwarded-for': '1.2.3.4' })))
      .toBe(loginClientKey(new Headers({ ...trusted, 'x-forwarded-for': '5.6.7.8' })));
  });

  it('denies missing or ambiguous ingress identities in production', async () => {
    expect(() => loginClientKey(new Headers({ 'x-forwarded-for': '192.0.2.1' }))).toThrow();
    expect(() => loginClientKey(new Headers({ 'x-login-client-ip': '192.0.2.1, 192.0.2.2' }))).toThrow();
    await expect(limitLogin(new Headers())).rejects.toThrow();
    expect(db.execute).not.toHaveBeenCalled();
  });

  it('normalizes equivalent IPv6 addresses', () => {
    expect(loginClientKey(new Headers({ 'x-login-client-ip': '2001:db8::1' })))
      .toBe(loginClientKey(new Headers({ 'x-login-client-ip': '2001:0db8:0:0:0:0:0:1' })));
  });

  it('uses the database counter and refuses attempts past ten', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce([{ attempts: 10, reset_seconds: 30 }] as never);
    expect(await limitLogin(new Headers({ 'x-login-client-ip': '192.0.2.1' })))
      .toEqual({ success: true, resetSeconds: 30 });
    vi.mocked(db.execute).mockResolvedValueOnce([{ attempts: 11, reset_seconds: 29 }] as never);
    expect(await limitLogin(new Headers({ 'x-login-client-ip': '192.0.2.1' })))
      .toEqual({ success: false, resetSeconds: 29 });
  });

  it('does not fall back to an instance-local allowance on database failure', async () => {
    vi.mocked(db.execute).mockRejectedValueOnce(new Error('database unavailable'));
    await expect(limitLogin(new Headers({ 'x-login-client-ip': '192.0.2.1' }))).rejects.toThrow();
  });
});
