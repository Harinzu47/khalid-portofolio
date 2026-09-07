import { describe, expect, it, vi } from 'vitest';
import type postgres from 'postgres';
import { assertAuthPrerequisites } from '../auth-prerequisites';

const ready = { has_uid: true, has_role: true, has_anon: true, has_authenticated: true, has_service_role: true };

function clientWith(state: Record<string, boolean>) {
  const unsafe = vi.fn().mockResolvedValue([state]);
  return { unsafe, client: { unsafe } as unknown as Pick<postgres.Sql, 'unsafe'> };
}

describe('Migration auth prerequisites', () => {
  it('performs only a catalog read for an initialized provider database', async () => {
    const { client, unsafe } = clientWith(ready);
    await expect(assertAuthPrerequisites(client)).resolves.toBeUndefined();
    expect(unsafe).toHaveBeenCalledTimes(1);
    const statement = unsafe.mock.calls[0][0] as string;
    expect(statement.trim()).toMatch(/^SELECT\s/);
    expect(statement).not.toMatch(/\b(CREATE|ALTER|DROP|REPLACE)\b/i);
  });

  it.each(Object.keys(ready))('aborts when %s is missing instead of provisioning stubs', async (missing) => {
    const { client, unsafe } = clientWith({ ...ready, [missing]: false });
    await expect(assertAuthPrerequisites(client)).rejects.toThrow('Auth database prerequisites are missing');
    expect(unsafe).toHaveBeenCalledTimes(1);
  });

  it('propagates database errors so migrations cannot continue unchecked', async () => {
    const { client, unsafe } = clientWith(ready);
    unsafe.mockRejectedValue(new Error('database unavailable'));
    await expect(assertAuthPrerequisites(client)).rejects.toThrow('database unavailable');
  });
});
