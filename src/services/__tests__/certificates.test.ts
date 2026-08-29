import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/db/client';
import { certificates, skills, media } from '@/db/schema';
import { CertificatesService } from '../certificates.service';
import { eq } from 'drizzle-orm';

describe('CertificatesService Integration & Evidence Invariant Tests', () => {
  const TEST_OWNER_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
  const OTHER_OWNER_ID = '00000000-0000-0000-0000-000000000002';

  let testSkillId: string;
  let testMediaId: string;
  let foreignMediaId: string;
  let foreignSkillId: string;
  const createdCertIds: string[] = [];

  beforeAll(async () => {
    // 1. Create owner-scoped Skill
    const [sk] = await db
      .insert(skills)
      .values({
        ownerId: TEST_OWNER_ID,
        name: 'Cloud Networking',
        slug: `cloud-net-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    testSkillId = sk.id;

    // 2. Create owner-scoped Media
    const [med] = await db
      .insert(media)
      .values({
        ownerId: TEST_OWNER_ID,
        path: 'certs/aws-cert.pdf',
        originalName: 'aws-cert.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
      })
      .returning();
    testMediaId = med.id;

    // 3. Create foreign Skill & Media
    const [foreignSk] = await db
      .insert(skills)
      .values({
        ownerId: OTHER_OWNER_ID,
        name: 'Foreign Skill',
        slug: `foreign-cert-sk-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    foreignSkillId = foreignSk.id;

    const [foreignMed] = await db
      .insert(media)
      .values({
        ownerId: OTHER_OWNER_ID,
        path: 'certs/foreign-cert.pdf',
        originalName: 'foreign-cert.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
      })
      .returning();
    foreignMediaId = foreignMed.id;
  });

  afterAll(async () => {
    for (const id of createdCertIds) {
      await db.delete(certificates).where(eq(certificates.id, id));
    }
    if (testSkillId) await db.delete(skills).where(eq(skills.id, testSkillId));
    if (foreignSkillId) await db.delete(skills).where(eq(skills.id, foreignSkillId));
    if (testMediaId) await db.delete(media).where(eq(media.id, testMediaId));
    if (foreignMediaId) await db.delete(media).where(eq(media.id, foreignMediaId));
  });

  it('creates a Certificate with safe defaults and links media/skills (Amendment 10, 26)', async () => {
    const cert = await CertificatesService.createCertificate(TEST_OWNER_ID, {
      name: 'AWS Certified Advanced Networking - Specialty',
      issuer: 'Amazon Web Services',
      issuedAt: '2025-06-15',
      expiresAt: '2028-06-15',
      credentialId: 'AWS-ANS-789012',
      credentialUrl: 'https://aws.amazon.com/verification',
      certificateMediaId: testMediaId,
      verificationStatus: 'verified',
      skillIds: [testSkillId],
    });
    createdCertIds.push(cert.id);

    expect(cert.id).toBeDefined();
    expect(cert.name).toBe('AWS Certified Advanced Networking - Specialty');
    expect(cert.issuer).toBe('Amazon Web Services');
    expect(cert.verificationStatus).toBe('verified');
    expect(cert.visibility).toBe('private');
    expect(cert.publicationStatus).toBe('draft');
    expect(cert.certificateMediaId).toBe(testMediaId);
    expect(cert.skillIds).toContain(testSkillId);

    // Verify DTO boundary
    expect((cert as any).ownerId).toBeUndefined();
  });

  it('keeps verification status independent from expiry date (Amendment 10)', async () => {
    // Certificate with past expiration date but explicitly verified status
    const expiredCert = await CertificatesService.createCertificate(TEST_OWNER_ID, {
      name: 'Legacy CCNA Routing & Switching',
      issuer: 'Cisco Systems',
      issuedAt: '2020-01-10',
      expiresAt: '2023-01-10', // In the past
      verificationStatus: 'verified', // Independent verification
    });
    createdCertIds.push(expiredCert.id);

    expect(expiredCert.verificationStatus).toBe('verified');
    expect(expiredCert.expiresAt).toBe('2023-01-10');
  });

  it('rejects certificate referencing foreign-owner media (Amendment 11)', async () => {
    await expect(
      CertificatesService.createCertificate(TEST_OWNER_ID, {
        name: 'Unauthorized Media Certificate',
        issuer: 'Some Issuer',
        issuedAt: '2026-01-01',
        certificateMediaId: foreignMediaId, // Belongs to OTHER_OWNER_ID
      })
    ).rejects.toThrow(/media does not exist or belongs to another owner/i);
  });

  it('rejects certificate referencing foreign-owner taxonomy (Amendment 13)', async () => {
    await expect(
      CertificatesService.createCertificate(TEST_OWNER_ID, {
        name: 'Unauthorized Skill Certificate',
        issuer: 'Some Issuer',
        issuedAt: '2026-01-01',
        skillIds: [foreignSkillId], // Belongs to OTHER_OWNER_ID
      })
    ).rejects.toThrow(/belong to another owner/i);
  });

  it('soft-archives a Certificate (Amendment 44)', async () => {
    const cert = await CertificatesService.createCertificate(TEST_OWNER_ID, {
      name: 'Archived Cert Test',
      issuer: 'Test Issuer',
      issuedAt: '2026-01-01',
    });
    createdCertIds.push(cert.id);

    await CertificatesService.archiveCertificate(TEST_OWNER_ID, cert.id);

    const archived = await CertificatesService.getCertificateEditorById(TEST_OWNER_ID, cert.id);
    expect(archived.archivedAt).toBeDefined();
  });
});
