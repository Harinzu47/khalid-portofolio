import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';

/** Read only a single IP header overwritten by a trusted ingress proxy. */
export function loginClientKey(requestHeaders: Pick<Headers, 'get'>): string {
  const header = process.env.LOGIN_CLIENT_IP_HEADER ||
    (process.env.NETLIFY === 'true' ? 'x-nf-client-connection-ip' : 'x-login-client-ip');
  const value = requestHeaders.get(header)?.trim();
  let ip = value;
  if (!ip && process.env.NODE_ENV !== 'production') ip = '127.0.0.1';
  if (!ip || !isIP(ip)) throw new Error('Trusted client IP unavailable');
  if (isIP(ip) === 6) ip = new URL(`http://[${ip}]`).hostname;
  return createHash('sha256').update(`login:${ip}`).digest('hex');
}

/** Atomic per-client counters shared by all app instances, using database time. */
export async function limitLogin(requestHeaders: Pick<Headers, 'get'>) {
  const key = loginClientKey(requestHeaders);
  const rows = await db.execute<{ attempts: number; reset_seconds: number }>(sql`
    WITH cleanup AS (
      DELETE FROM app_private.login_rate_limits WHERE client_key IN (
        SELECT client_key FROM app_private.login_rate_limits
        WHERE expires_at < now() - interval '1 day' AND client_key <> ${key}
        LIMIT 100 FOR UPDATE SKIP LOCKED
      )
    )
    INSERT INTO app_private.login_rate_limits AS limits (client_key, attempts, expires_at)
    VALUES (${key}, 1, now() + interval '60 seconds')
    ON CONFLICT (client_key) DO UPDATE SET
      attempts = CASE WHEN limits.expires_at <= now() THEN 1
        ELSE least(limits.attempts + 1, 11) END,
      expires_at = CASE WHEN limits.expires_at <= now() THEN now() + interval '60 seconds'
        ELSE limits.expires_at END
    RETURNING attempts, greatest(1, ceil(extract(epoch FROM (expires_at - now()))))::int AS reset_seconds
  `);
  if (!rows[0]) throw new Error('Login limiter unavailable');
  return { success: rows[0].attempts <= 10, resetSeconds: rows[0].reset_seconds };
}
