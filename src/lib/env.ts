import { z } from 'zod';

/**
 * Schema for core application server-side environment variables.
 * These are required for normal public/server/authenticated RLS operation.
 */
export const ServerEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

/**
 * Schema for privileged service-role environment variables.
 * Kept separate so an invalid or missing service role key does not crash normal application runtime.
 */
export const PrivilegedEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
});

/**
 * Schema for optional operational environment variables.
 * These enable degraded-mode features; absence must not crash the application.
 */
export const OptionalEnvSchema = z.object({
  CRON_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  OWNER_USER_ID: z.string().uuid().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type PrivilegedEnv = z.infer<typeof PrivilegedEnvSchema>;

export type ServiceRoleKeyStatus = 'VALID' | 'INVALID' | 'MISSING';

/**
 * Environment variable criticality classification.
 */
export type EnvCriticality = 'CRITICAL' | 'PRIVILEGED' | 'OPTIONAL';

export interface EnvVariableReport {
  name: string;
  criticality: EnvCriticality;
  status: 'PRESENT' | 'MISSING' | 'INVALID';
  error?: string;
}

export interface EnvValidationReport {
  healthy: boolean;
  variables: EnvVariableReport[];
}

/**
 * Validates baseline server environment variables.
 * Safe to call on application boot.
 */
export function validateServerEnv(): { success: true; data: ServerEnv } | { success: false; errors: Record<string, string[]> } {
  const result = ServerEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  return { success: true, data: result.data };
}

/**
 * Inspects the configured service role key without printing it.
 * If JWT-formatted, verifies the role claim is 'service_role'.
 */
export function getServiceRoleKeyStatus(): ServiceRoleKeyStatus {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return 'MISSING';
  }

  // Check if JWT-formatted (three base64url segments separated by dots)
  const parts = key.split('.');
  if (parts.length === 3) {
    try {
      const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);
      if (payload && typeof payload === 'object' && 'role' in payload) {
        return payload.role === 'service_role' ? 'VALID' : 'INVALID';
      }
    } catch {
      // If decoding fails, do not assume invalid if it's a non-standard opaque token
      return 'VALID';
    }
  }

  // If opaque token format, accept as provided without claiming JWT invalidity
  return 'VALID';
}

/**
 * Validates privileged environment configuration when a privileged operation is executed.
 * Throws explicit descriptive error without exposing secret values.
 */
export function requirePrivilegedEnv(): { supabaseUrl: string; serviceRoleKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('CONFIG_ERROR: NEXT_PUBLIC_SUPABASE_URL is not configured.');
  }

  if (!serviceRoleKey) {
    throw new Error('SERVICE_ROLE_KEY_MISSING: SUPABASE_SERVICE_ROLE_KEY must be configured for privileged operations.');
  }

  const status = getServiceRoleKeyStatus();
  if (status === 'INVALID') {
    throw new Error(
      'SERVICE_ROLE_KEY_INVALID: The configured SUPABASE_SERVICE_ROLE_KEY does not contain the required "service_role" claim. Privileged operations are blocked until a valid key is provided in the environment.'
    );
  }

  return { supabaseUrl, serviceRoleKey };
}

/**
 * Phase 11: Comprehensive environment validation report.
 * Distinguishes CRITICAL (app cannot operate), PRIVILEGED (admin features degraded),
 * and OPTIONAL (feature disabled gracefully) variables.
 *
 * Never logs or exposes secret values — only names and statuses.
 */
export function validateAllEnv(): EnvValidationReport {
  const variables: EnvVariableReport[] = [];
  let healthy = true;

  // --- CRITICAL: Application cannot safely operate without these ---
  const criticalVars: Array<{ name: string; value: string | undefined; validate?: (v: string) => string | null }> = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      validate: (v) => {
        try { new URL(v); return null; } catch { return 'Not a valid URL'; }
      },
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    {
      name: 'DATABASE_URL',
      value: process.env.DATABASE_URL,
    },
  ];

  for (const v of criticalVars) {
    if (!v.value) {
      variables.push({ name: v.name, criticality: 'CRITICAL', status: 'MISSING' });
      healthy = false;
    } else if (v.validate) {
      const error = v.validate(v.value);
      if (error) {
        variables.push({ name: v.name, criticality: 'CRITICAL', status: 'INVALID', error });
        healthy = false;
      } else {
        variables.push({ name: v.name, criticality: 'CRITICAL', status: 'PRESENT' });
      }
    } else {
      variables.push({ name: v.name, criticality: 'CRITICAL', status: 'PRESENT' });
    }
  }

  // --- PRIVILEGED: Admin/service-role features degraded without these ---
  const serviceKeyStatus = getServiceRoleKeyStatus();
  variables.push({
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    criticality: 'PRIVILEGED',
    status: serviceKeyStatus === 'MISSING' ? 'MISSING' : serviceKeyStatus === 'INVALID' ? 'INVALID' : 'PRESENT',
    ...(serviceKeyStatus === 'INVALID' && { error: 'JWT role claim is not service_role' }),
  });

  // --- OPTIONAL: Feature disabled gracefully when absent ---
  const optionalVars: Array<{ name: string; value: string | undefined; validate?: (v: string) => string | null }> = [
    {
      name: 'NEXT_PUBLIC_SITE_URL',
      value: process.env.NEXT_PUBLIC_SITE_URL,
      validate: (v) => {
        try { new URL(v); return null; } catch { return 'Not a valid URL'; }
      },
    },
    { name: 'CRON_SECRET', value: process.env.CRON_SECRET },
    { name: 'OWNER_USER_ID', value: process.env.OWNER_USER_ID },
  ];

  for (const v of optionalVars) {
    if (!v.value) {
      variables.push({ name: v.name, criticality: 'OPTIONAL', status: 'MISSING' });
    } else if (v.validate) {
      const error = v.validate(v.value);
      if (error) {
        variables.push({ name: v.name, criticality: 'OPTIONAL', status: 'INVALID', error });
      } else {
        variables.push({ name: v.name, criticality: 'OPTIONAL', status: 'PRESENT' });
      }
    } else {
      variables.push({ name: v.name, criticality: 'OPTIONAL', status: 'PRESENT' });
    }
  }

  return { healthy, variables };
}
