import { auditLogs } from '@/db/schema';
import type { Database } from '@/db/client';

export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

export interface RecordAuditLogParams {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Service for recording immutable system and entity audit logs.
 */
export class AuditService {
  /**
   * Records an audit log entry within an active database transaction.
   */
  static async record(tx: Transaction, params: RecordAuditLogParams): Promise<void> {
    try {
      await tx.insert(auditLogs).values({
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValues: params.oldValues ?? null,
        newValues: params.newValues ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('[AuditService.record] Failed to write audit log:', err);
      // We log error but do not necessarily abort transaction unless required by compliance
    }
  }
}
