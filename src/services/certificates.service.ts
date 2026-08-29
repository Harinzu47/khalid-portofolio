import { db } from '@/db/client';
import {
  certificates,
  certificateSkills,
  certificateDomains,
  certificateTechnologies,
  media,
  skills,
  domains,
  technologies,
} from '@/db/schema';
import { eq, desc, and, isNull, sql, inArray } from 'drizzle-orm';
import { NotFoundError, AppError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { CertificateFormInput } from '@/validations/certificate';
import type {
  CertificateListItemDTO,
  CertificateEditorDTO,
  CertificateVerificationStatus,
  PaginatedResultDTO,
} from '@/types/dtos';

/**
 * Validates ownership of certificate media and taxonomy references (Amendments 11, 13).
 */
async function validateCertificateRelationsOwnership(
  tx: any,
  ownerId: string,
  relations: {
    certificateMediaId?: string | null;
    skillIds?: string[];
    domainIds?: string[];
    technologyIds?: string[];
  }
) {
  // 1. Verify Media ownership (Amendment 11)
  if (relations.certificateMediaId) {
    const foundMedia = await tx.query.media.findFirst({
      where: and(eq(media.id, relations.certificateMediaId), eq(media.ownerId, ownerId)),
    });
    if (!foundMedia) {
      throw new AppError(
        'The specified certificate media does not exist or belongs to another owner.',
        'VALIDATION_ERROR',
        400
      );
    }
  }

  // 2. Verify Taxonomy ownership (Amendment 13)
  if (relations.skillIds && relations.skillIds.length > 0) {
    const found = await tx.query.skills.findMany({
      where: and(inArray(skills.id, relations.skillIds), eq(skills.ownerId, ownerId)),
      columns: { id: true },
    });
    if (found.length !== relations.skillIds.length) {
      throw new AppError(
        'One or more linked skills do not exist or belong to another owner.',
        'VALIDATION_ERROR',
        400
      );
    }
  }

  if (relations.domainIds && relations.domainIds.length > 0) {
    const found = await tx.query.domains.findMany({
      where: and(inArray(domains.id, relations.domainIds), eq(domains.ownerId, ownerId)),
      columns: { id: true },
    });
    if (found.length !== relations.domainIds.length) {
      throw new AppError(
        'One or more linked domains do not exist or belong to another owner.',
        'VALIDATION_ERROR',
        400
      );
    }
  }

  if (relations.technologyIds && relations.technologyIds.length > 0) {
    const found = await tx.query.technologies.findMany({
      where: and(inArray(technologies.id, relations.technologyIds), eq(technologies.ownerId, ownerId)),
      columns: { id: true },
    });
    if (found.length !== relations.technologyIds.length) {
      throw new AppError(
        'One or more linked technologies do not exist or belong to another owner.',
        'VALIDATION_ERROR',
        400
      );
    }
  }
}

export class CertificatesService {
  /**
   * Fetches public certificates and credentials (for public /certificates page).
   */
  static async getPublicCertificates() {
    return await db.query.certificates.findMany({
      where: and(
        eq(certificates.visibility, 'public'),
        eq(certificates.publicationStatus, 'published'),
        isNull(certificates.archivedAt)
      ),
      orderBy: [desc(certificates.issuedAt)],
    });
  }

  /**
   * Owner-scoped query: Retrieves paginated certificates for administrative workspace.
   */
  static async getAdminCertificates(
    ownerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResultDTO<CertificateListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = and(eq(certificates.ownerId, ownerId));

    const [data, countResult] = await Promise.all([
      db.query.certificates.findMany({
        where: conditions,
        orderBy: [desc(certificates.issuedAt), desc(certificates.createdAt)],
        limit,
        offset,
        with: {
          skills: { with: { skill: true } },
          domains: { with: { domain: true } },
          technologies: { with: { technology: true } },
        },
      }),
      db.select({ count: sql<number>`count(*)::int` }).from(certificates).where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;

    const formattedData: CertificateListItemDTO[] = data.map((cert) => ({
      id: cert.id,
      name: cert.name,
      title: cert.title,
      issuer: cert.issuer,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      verificationStatus: cert.verificationStatus as CertificateVerificationStatus,
      visibility: cert.visibility as any,
      publicationStatus: cert.publicationStatus,
      skills: (cert.skills || []).map((s: any) => ({
        id: s.skill?.id || s.skillId,
        name: s.skill?.name || 'Skill',
      })),
      domains: (cert.domains || []).map((d: any) => ({
        id: d.domain?.id || d.domainId,
        name: d.domain?.name || 'Domain',
      })),
      technologies: (cert.technologies || []).map((t: any) => ({
        id: t.technology?.id || t.technologyId,
        name: t.technology?.name || 'Technology',
      })),
      createdAt: cert.createdAt.toISOString(),
      updatedAt: cert.updatedAt.toISOString(),
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Owner-scoped query: Retrieves certificate by ID for editor.
   */
  static async getCertificateEditorById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<CertificateEditorDTO> {
    const cert = await executor.query.certificates.findFirst({
      where: and(eq(certificates.id, id), eq(certificates.ownerId, ownerId)),
      with: {
        media: true,
        skills: { with: { skill: true } },
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
      },
    });

    if (!cert) {
      throw new NotFoundError('Certificate', id);
    }

    return {
      id: cert.id,
      name: cert.name,
      title: cert.title,
      issuer: cert.issuer,
      credentialId: cert.credentialId,
      credentialUrl: cert.credentialUrl,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      certificateMediaId: cert.certificateMediaId,
      certificateMediaUrl: cert.media?.url || null,
      description: cert.description,
      verificationStatus: cert.verificationStatus as CertificateVerificationStatus,
      visibility: cert.visibility as any,
      publicationStatus: cert.publicationStatus,
      skillIds: (cert.skills || []).map((s: any) => s.skillId),
      domainIds: (cert.domains || []).map((d: any) => d.domainId),
      technologyIds: (cert.technologies || []).map((t: any) => t.technologyId),
      skills: (cert.skills || []).map((s: any) => ({
        id: s.skill?.id || s.skillId,
        name: s.skill?.name || 'Skill',
      })),
      domains: (cert.domains || []).map((d: any) => ({
        id: d.domain?.id || d.domainId,
        name: d.domain?.name || 'Domain',
      })),
      technologies: (cert.technologies || []).map((t: any) => ({
        id: t.technology?.id || t.technologyId,
        name: t.technology?.name || 'Technology',
      })),
      createdAt: cert.createdAt.toISOString(),
      updatedAt: cert.updatedAt.toISOString(),
      archivedAt: cert.archivedAt ? cert.archivedAt.toISOString() : null,
    };
  }

  /**
   * Creates a new verified Certificate entry atomically (Owner scoped).
   */
  static async createCertificate(
    ownerId: string,
    input: CertificateFormInput,
    actorId?: string
  ): Promise<CertificateEditorDTO> {
    return await db.transaction(async (tx) => {
      // 1. Validate ownership of media and taxonomy relations (Amendments 11, 13)
      await validateCertificateRelationsOwnership(tx, ownerId, {
        certificateMediaId: input.certificateMediaId,
        skillIds: input.skillIds,
        domainIds: input.domainIds,
        technologyIds: input.technologyIds,
      });

      // 2. Insert row
      const [newCert] = await tx
        .insert(certificates)
        .values({
          ownerId,
          name: input.name.trim(),
          title: input.title ? input.title.trim() : null,
          issuer: input.issuer.trim(),
          credentialId: input.credentialId || null,
          credentialUrl: input.credentialUrl || null,
          issuedAt: input.issuedAt,
          expiresAt: input.expiresAt || null,
          certificateMediaId: input.certificateMediaId || null,
          description: input.description || null,
          verificationStatus: input.verificationStatus || 'unverified',
          visibility: input.visibility || 'private',
          publicationStatus: 'draft', // Strict DRAFT default (Amendment 14)
        })
        .returning();

      // 3. Sync Junctions
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(certificateSkills).values(
          input.skillIds.map((skillId) => ({
            certificateId: newCert.id,
            skillId,
          }))
        );
      }

      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(certificateDomains).values(
          input.domainIds.map((domainId) => ({
            certificateId: newCert.id,
            domainId,
          }))
        );
      }

      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(certificateTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            certificateId: newCert.id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'CERTIFICATE_CREATE',
        entityType: 'certificate',
        entityId: newCert.id,
        newValues: newCert,
      });

      return await CertificatesService.getCertificateEditorById(ownerId, newCert.id, tx);
    });
  }

  /**
   * Updates an existing certificate entry atomically (Owner scoped).
   */
  static async updateCertificate(
    ownerId: string,
    id: string,
    input: Partial<CertificateFormInput>,
    actorId?: string
  ): Promise<CertificateEditorDTO> {
    const existing = await db.query.certificates.findFirst({
      where: and(eq(certificates.id, id), eq(certificates.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Certificate', id);
    }

    return await db.transaction(async (tx) => {
      // 1. Validate ownership of media and taxonomy relations (Amendments 11, 13)
      await validateCertificateRelationsOwnership(tx, ownerId, {
        certificateMediaId: input.certificateMediaId,
        skillIds: input.skillIds,
        domainIds: input.domainIds,
        technologyIds: input.technologyIds,
      });

      // 2. Update scalar fields
      const [updatedCert] = await tx
        .update(certificates)
        .set({
          name: input.name !== undefined ? input.name.trim() : existing.name,
          title: input.title !== undefined ? (input.title ? input.title.trim() : null) : existing.title,
          issuer: input.issuer !== undefined ? input.issuer.trim() : existing.issuer,
          credentialId: input.credentialId !== undefined ? input.credentialId : existing.credentialId,
          credentialUrl: input.credentialUrl !== undefined ? input.credentialUrl : existing.credentialUrl,
          issuedAt: input.issuedAt !== undefined ? input.issuedAt : existing.issuedAt,
          expiresAt: input.expiresAt !== undefined ? input.expiresAt : existing.expiresAt,
          certificateMediaId:
            input.certificateMediaId !== undefined ? input.certificateMediaId : existing.certificateMediaId,
          description: input.description !== undefined ? input.description : existing.description,
          verificationStatus:
            input.verificationStatus !== undefined ? input.verificationStatus : existing.verificationStatus,
          visibility: input.visibility || existing.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(certificates.id, id), eq(certificates.ownerId, ownerId)))
        .returning();

      // 3. Sync Junctions if provided
      if (input.skillIds !== undefined) {
        await tx.delete(certificateSkills).where(eq(certificateSkills.certificateId, id));
        if (input.skillIds.length > 0) {
          await tx.insert(certificateSkills).values(
            input.skillIds.map((skillId) => ({
              certificateId: id,
              skillId,
            }))
          );
        }
      }

      if (input.domainIds !== undefined) {
        await tx.delete(certificateDomains).where(eq(certificateDomains.certificateId, id));
        if (input.domainIds.length > 0) {
          await tx.insert(certificateDomains).values(
            input.domainIds.map((domainId) => ({
              certificateId: id,
              domainId,
            }))
          );
        }
      }

      if (input.technologyIds !== undefined) {
        await tx.delete(certificateTechnologies).where(eq(certificateTechnologies.certificateId, id));
        if (input.technologyIds.length > 0) {
          await tx.insert(certificateTechnologies).values(
            input.technologyIds.map((technologyId) => ({
              certificateId: id,
              technologyId,
            }))
          );
        }
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'CERTIFICATE_UPDATE',
        entityType: 'certificate',
        entityId: id,
        oldValues: existing,
        newValues: updatedCert,
      });

      return await CertificatesService.getCertificateEditorById(ownerId, id, tx);
    });
  }

  /**
   * Soft-archives a Certificate: archivedAt = now (Amendment 44).
   */
  static async archiveCertificate(
    ownerId: string,
    id: string,
    actorId?: string
  ): Promise<void> {
    const existing = await db.query.certificates.findFirst({
      where: and(eq(certificates.id, id), eq(certificates.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Certificate', id);
    }

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(certificates)
        .set({
          archivedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(certificates.id, id), eq(certificates.ownerId, ownerId)))
        .returning();

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'CERTIFICATE_ARCHIVE',
        entityType: 'certificate',
        entityId: id,
        oldValues: existing,
        newValues: updated,
      });
    });
  }
}
