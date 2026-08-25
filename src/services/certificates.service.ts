import { db } from '@/db/client';
import { certificates } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { CertificateFormInput } from '@/validations/certificate';

export class CertificatesService {
  /**
   * Fetches public certificates and credentials.
   */
  static async getPublicCertificates() {
    return await db.query.certificates.findMany({
      orderBy: [desc(certificates.issuedAt)],
    });
  }

  /**
   * Fetches all certificates for the administrative workspace.
   */
  static async getAdminCertificates(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const [data, countResult] = await Promise.all([
      db.query.certificates.findMany({
        orderBy: [desc(certificates.issuedAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)::int` }).from(certificates),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Fetches a certificate by ID for editing in admin.
   */
  static async getAdminCertificateById(id: string) {
    const cert = await db.query.certificates.findFirst({
      where: eq(certificates.id, id),
    });

    if (!cert) {
      throw new NotFoundError('Certificate', id);
    }

    return cert;
  }

  /**
   * Creates a new verified certificate entry atomically with audit logging.
   */
  static async createCertificate(input: CertificateFormInput, actorId?: string) {
    return await db.transaction(async (tx) => {
      const [newCert] = await tx
        .insert(certificates)
        .values({
          name: input.name,
          issuer: input.issuer,
          issuedAt: input.issuedAt,
          expiresAt: input.expiresAt || null,
          credentialId: input.credentialId || null,
          credentialUrl: input.credentialUrl || null,
          certificateMediaId: input.certificateMediaId || null,
          description: input.description || null,
        })
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'CERTIFICATE_CREATE',
        entityType: 'certificate',
        entityId: newCert.id,
        newValues: newCert,
      });

      return newCert;
    });
  }

  /**
   * Updates an existing certificate entry atomically.
   */
  static async updateCertificate(id: string, input: CertificateFormInput, actorId?: string) {
    const existing = await db.query.certificates.findFirst({
      where: eq(certificates.id, id),
    });

    if (!existing) {
      throw new NotFoundError('Certificate', id);
    }

    return await db.transaction(async (tx) => {
      const [updatedCert] = await tx
        .update(certificates)
        .set({
          name: input.name,
          issuer: input.issuer,
          issuedAt: input.issuedAt,
          expiresAt: input.expiresAt || null,
          credentialId: input.credentialId || null,
          credentialUrl: input.credentialUrl || null,
          certificateMediaId: input.certificateMediaId || null,
          description: input.description || null,
          updatedAt: new Date(),
        })
        .where(eq(certificates.id, id))
        .returning();

      await AuditService.record(tx, {
        actorId,
        action: 'CERTIFICATE_UPDATE',
        entityType: 'certificate',
        entityId: id,
        oldValues: existing,
        newValues: updatedCert,
      });

      return updatedCert;
    });
  }

  /**
   * Deletes a certificate entry.
   */
  static async deleteCertificate(id: string, actorId?: string) {
    const existing = await db.query.certificates.findFirst({
      where: eq(certificates.id, id),
    });

    if (!existing) {
      throw new NotFoundError('Certificate', id);
    }

    return await db.transaction(async (tx) => {
      await tx.delete(certificates).where(eq(certificates.id, id));

      await AuditService.record(tx, {
        actorId,
        action: 'CERTIFICATE_DELETE',
        entityType: 'certificate',
        entityId: id,
        oldValues: existing,
      });
    });
  }
}
