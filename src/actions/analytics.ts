'use server';

import { requireAuth } from '@/lib/auth';
import { AnalyticsService } from '@/services/analytics.service';
import type { ActionResult } from './auth';

export async function exportAuditLogsAction(): Promise<ActionResult> {
  await requireAuth('/admin/audit-logs');

  try {
    const logs = await AnalyticsService.exportAuditLogs();
    return { success: true, data: logs };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to export audit logs.',
    };
  }
}
