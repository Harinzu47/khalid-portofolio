import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validateServerEnv,
  getServiceRoleKeyStatus,
  requirePrivilegedEnv,
} from '../env';

describe('Environment Validation Layer', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('validates server environment when all required variables are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

    const result = validateServerEnv();
    expect(result.success).toBe(true);
  });

  it('fails server environment validation when required variables are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const result = validateServerEnv();
    expect(result.success).toBe(false);
  });

  it('detects missing service role key', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(getServiceRoleKeyStatus()).toBe('MISSING');
  });

  it('detects JWT role mismatch (anon role passed as service role key)', () => {
    // Construct fake JWT with role: 'anon'
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ role: 'anon', iss: 'supabase' })).toString('base64');
    const fakeAnonKey = `${header}.${payload}.signature`;

    process.env.SUPABASE_SERVICE_ROLE_KEY = fakeAnonKey;
    expect(getServiceRoleKeyStatus()).toBe('INVALID');
  });

  it('validates JWT with service_role claim', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ role: 'service_role', iss: 'supabase' })).toString('base64');
    const fakeServiceKey = `${header}.${payload}.signature`;

    process.env.SUPABASE_SERVICE_ROLE_KEY = fakeServiceKey;
    expect(getServiceRoleKeyStatus()).toBe('VALID');
  });

  it('throws descriptive error on requirePrivilegedEnv when service role key has anon role', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ role: 'anon', iss: 'supabase' })).toString('base64');
    process.env.SUPABASE_SERVICE_ROLE_KEY = `${header}.${payload}.signature`;

    expect(() => requirePrivilegedEnv()).toThrowError(/SERVICE_ROLE_KEY_INVALID/);
  });
});
