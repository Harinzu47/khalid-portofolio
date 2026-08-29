import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from '@/db/client';
import { media, projectMedia, projects, certificates, articles, auditLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { MediaService } from '../media.service';
import { AppError, NotFoundError } from '@/lib/errors';
import { StorageService } from '@/lib/supabase/storage';
import { ok } from '@/lib/result';

const OWNER_A_ID = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';
const OWNER_B_ID = 'a0000000-0000-0000-0000-000000000002';

// Valid 1x1 PNG Buffer
const VALID_PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82,
]);

// Valid JPEG header
const VALID_JPEG_BUFFER = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
  0x00, 0x60, 0x00, 0x00, 0xff, 0xd9
]);

describe('Phase 8: MediaService & Asset Architecture', () => {
  const createdMediaIds: string[] = [];
  const createdProjectIds: string[] = [];
  const createdCertIds: string[] = [];
  const createdArticleIds: string[] = [];

  beforeEach(() => {
    vi.spyOn(StorageService, 'upload').mockImplementation(async (options) => {
      return ok({
        path: options.path,
        fullPath: `portfolio/${options.path}`,
        publicUrl: `https://supabase.local/storage/v1/object/public/portfolio/${options.path}`,
      });
    });

    vi.spyOn(StorageService, 'deleteObject').mockImplementation(async () => {
      return ok(undefined);
    });

    vi.spyOn(StorageService, 'getSignedUrl').mockImplementation(async (path) => {
      return ok(`https://supabase.local/storage/v1/object/sign/portfolio/${path}?token=mock_signed_token`);
    });

    vi.spyOn(StorageService, 'getPublicUrl').mockImplementation(async (path) => {
      return `https://supabase.local/storage/v1/object/public/portfolio/${path}`;
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();

    // Cleanup created test records
    for (const id of createdArticleIds) {
      await db.delete(articles).where(eq(articles.id, id));
    }
    for (const id of createdCertIds) {
      await db.delete(certificates).where(eq(certificates.id, id));
    }
    for (const id of createdProjectIds) {
      await db.delete(projectMedia).where(eq(projectMedia.projectId, id));
      await db.delete(projects).where(eq(projects.id, id));
    }
    for (const id of createdMediaIds) {
      await db.delete(projectMedia).where(eq(projectMedia.mediaId, id));
      await db.delete(media).where(eq(media.id, id));
    }
    createdArticleIds.length = 0;
    createdCertIds.length = 0;
    createdProjectIds.length = 0;
    createdMediaIds.length = 0;
  });

  describe('1. Upload & Storage Isolation (Amendments 5, 9, 12, 22, 39)', () => {
    it('uploads valid image with owner-isolated path, private default, audit, and sanitized DTO', async () => {
      const uploaded = await MediaService.uploadMedia(
        OWNER_A_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'My Architecture Diagram! (Final).png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
          altText: 'Core Architecture Overview',
        },
        OWNER_A_ID
      );

      createdMediaIds.push(uploaded.id);

      // Verify DTO properties (Amendment 39 - zero ownerId leakage)
      expect(uploaded.id).toBeDefined();
      expect((uploaded as any).ownerId).toBeUndefined();
      expect(uploaded.originalName).toBe('My Architecture Diagram! (Final).png');
      expect(uploaded.mimeType).toBe('image/png');
      expect(uploaded.mediaKind).toBe('IMAGE');
      expect(uploaded.visibility).toBe('private'); // Private by default (Amendment 5)
      expect(uploaded.altText).toBe('Core Architecture Overview');

      // Verify DB storage path format (Amendment 9, 12: <ownerId>/<mediaId>/<safeFilename>)
      expect(uploaded.storagePath).toMatch(new RegExp(`^${OWNER_A_ID}/${uploaded.id}/My_Architecture_Diagram_Final\\.png$`));

      // Verify audit event
      const audit = await db.query.auditLogs.findFirst({
        where: and(eq(auditLogs.entityId, uploaded.id), eq(auditLogs.action, 'MEDIA_UPLOAD')),
      });
      expect(audit).toBeDefined();
      expect(audit?.actorId).toBe(OWNER_A_ID);
    });

    it('rejects upload with spoofed MIME type (text renamed to jpg) (Amendment 15)', async () => {
      const spoofedBuffer = Buffer.from('Hello, I am actually a plain text file, not a JPEG!');
      await expect(
        MediaService.uploadMedia(
          OWNER_A_ID,
          {
            file: spoofedBuffer,
            originalName: 'fake_image.jpg',
            mimeType: 'image/jpeg',
            sizeBytes: spoofedBuffer.length,
          },
          OWNER_A_ID
        )
      ).rejects.toThrow(/header bytes do not match/i);
    });

    it('rejects disallowed SVG format (Amendment 16)', async () => {
      const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      await expect(
        MediaService.uploadMedia(
          OWNER_A_ID,
          {
            file: svgBuffer,
            originalName: 'exploit.svg',
            mimeType: 'image/svg+xml',
            sizeBytes: svgBuffer.length,
          },
          OWNER_A_ID
        )
      ).rejects.toThrow(/unsupported file format/i);
    });

    it('rejects mismatched file extension (Amendment 15)', async () => {
      await expect(
        MediaService.uploadMedia(
          OWNER_A_ID,
          {
            file: VALID_PNG_BUFFER,
            originalName: 'mismatched.pdf',
            mimeType: 'image/png',
            sizeBytes: VALID_PNG_BUFFER.length,
          },
          OWNER_A_ID
        )
      ).rejects.toThrow(/extension "\.pdf" does not match declared MIME type/i);
    });

    it('rejects oversized file according to centralized policy (Amendment 18)', async () => {
      const largeSize = 15 * 1024 * 1024; // 15MB (exceeds 10MB image limit)
      await expect(
        MediaService.uploadMedia(
          OWNER_A_ID,
          {
            file: VALID_JPEG_BUFFER,
            originalName: 'huge.jpg',
            mimeType: 'image/jpeg',
            sizeBytes: largeSize,
          },
          OWNER_A_ID
        )
      ).rejects.toThrow(/exceeds maximum allowed limit of 10 MB/i);
    });

    it('performs compensating storage cleanup if database insert fails (Amendments 21, 85)', async () => {
      const deleteObjectSpy = vi.spyOn(StorageService, 'deleteObject');

      // Mock executor that simulates DB constraint failure
      const failingExecutor = {
        insert: () => {
          throw new Error('Simulated PostgreSQL connection failure');
        },
      } as any;

      await expect(
        MediaService.uploadMedia(
          OWNER_A_ID,
          {
            file: VALID_PNG_BUFFER,
            originalName: 'compensation_test.png',
            mimeType: 'image/png',
            sizeBytes: VALID_PNG_BUFFER.length,
          },
          OWNER_A_ID,
          failingExecutor
        )
      ).rejects.toThrow(/Simulated PostgreSQL connection failure/i);

      // Verify compensating storage delete was triggered
      expect(deleteObjectSpy).toHaveBeenCalled();
    });
  });

  describe('2. Cross-Owner Isolation (Amendments 13, 14, 52, 53, 54)', () => {
    let ownerAMediaId: string;

    beforeEach(async () => {
      const uploaded = await MediaService.uploadMedia(
        OWNER_A_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'private_asset_a.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
        },
        OWNER_A_ID
      );
      ownerAMediaId = uploaded.id;
      createdMediaIds.push(ownerAMediaId);
    });

    it('OWNER_B cannot read OWNER_A media by ID', async () => {
      await expect(
        MediaService.getMediaById(OWNER_B_ID, ownerAMediaId)
      ).rejects.toThrow(NotFoundError);
    });

    it('OWNER_B cannot edit OWNER_A media metadata', async () => {
      await expect(
        MediaService.updateMediaMetadata(
          OWNER_B_ID,
          {
            mediaId: ownerAMediaId,
            altText: 'Hacked alt text',
          },
          OWNER_B_ID
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('OWNER_B cannot archive OWNER_A media', async () => {
      await expect(
        MediaService.archiveMedia(OWNER_B_ID, ownerAMediaId, OWNER_B_ID)
      ).rejects.toThrow(NotFoundError);
    });

    it('OWNER_B cannot delete OWNER_A media permanently', async () => {
      await expect(
        MediaService.deleteMediaPermanently(OWNER_B_ID, ownerAMediaId, OWNER_B_ID)
      ).rejects.toThrow(NotFoundError);
    });

    it('OWNER_A project cannot attach OWNER_B media (Amendment 24, 54)', async () => {
      // 1. Create OWNER_B media
      const bMedia = await MediaService.uploadMedia(
        OWNER_B_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'b_media.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
        },
        OWNER_B_ID
      );
      createdMediaIds.push(bMedia.id);

      // 2. Create OWNER_A Project
      const [proj] = await db
        .insert(projects)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Owner A Project',
          slug: 'owner-a-project-media-test',
          description: 'Testing cross-owner media rejection',
          publicationStatus: 'draft',
          visibility: 'private',
        })
        .returning();
      createdProjectIds.push(proj.id);

      // 3. Attempt reordering with OWNER_B media
      await expect(
        MediaService.reorderProjectMedia(
          OWNER_A_ID,
          proj.id,
          [bMedia.id],
          bMedia.id,
          OWNER_A_ID
        )
      ).rejects.toThrow(/Cannot attach media belonging to another owner/i);
    });

    it('OWNER_A article rejects attaching OWNER_B media as ogImageId (Amendment 24, 54)', async () => {
      // 1. Create OWNER_B media
      const bMedia = await MediaService.uploadMedia(
        OWNER_B_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'b_og_image.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
        },
        OWNER_B_ID
      );
      createdMediaIds.push(bMedia.id);

      // 2. Attempt creating OWNER_A article referencing OWNER_B media
      const { ArticlesService } = await import('../articles.service');
      await expect(
        ArticlesService.createArticle(
          OWNER_A_ID,
          {
            title: 'Unauthorized OG Image Article',
            content: 'Content...',
            ogImageId: bMedia.id,
          },
          OWNER_A_ID
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('OWNER_A certificate rejects attaching OWNER_B media (Amendment 24, 54)', async () => {
      // 1. Create OWNER_B media
      const bMedia = await MediaService.uploadMedia(
        OWNER_B_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'b_cert_proof.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
        },
        OWNER_B_ID
      );
      createdMediaIds.push(bMedia.id);

      // 2. Attempt creating OWNER_A certificate referencing OWNER_B media
      const { CertificatesService } = await import('../certificates.service');
      await expect(
        CertificatesService.createCertificate(
          OWNER_A_ID,
          {
            name: 'Unauthorized Proof Cert',
            issuer: 'Test Org',
            issuedAt: '2026-01-15',
            certificateMediaId: bMedia.id,
          },
          OWNER_A_ID
        )
      ).rejects.toThrow(/media does not exist or belongs to another owner/i);
    });
  });

  describe('3. Structural References & Usage Tracking (Amendments 23, 24, 35, 82)', () => {
    it('accurately reports structural references across projects, certificates, and articles', async () => {
      // 1. Create media
      const mediaItem = await MediaService.uploadMedia(
        OWNER_A_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'multipurpose.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
        },
        OWNER_A_ID
      );
      createdMediaIds.push(mediaItem.id);

      // 2. Attach to Project
      const [proj] = await db
        .insert(projects)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Super Platform',
          slug: 'super-platform-usage',
          description: 'A platform',
          publicationStatus: 'published',
          visibility: 'public',
        })
        .returning();
      createdProjectIds.push(proj.id);

      await db.insert(projectMedia).values({
        projectId: proj.id,
        mediaId: mediaItem.id,
        sortOrder: 0,
        isCover: true,
      });

      // 3. Attach to Certificate
      const [cert] = await db
        .insert(certificates)
        .values({
          ownerId: OWNER_A_ID,
          name: 'Cloud Security Professional',
          issuer: 'Google Cloud',
          issuedAt: '2026-01-15',
          certificateMediaId: mediaItem.id,
          publicationStatus: 'published',
          visibility: 'public',
        })
        .returning();
      createdCertIds.push(cert.id);

      // 4. Attach to Article (ogImageId)
      const [art] = await db
        .insert(articles)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Microservices in 2026',
          slug: 'microservices-in-2026-usage',
          content: 'Deep architectural dive',
          ogImageId: mediaItem.id,
          publicationStatus: 'draft',
          visibility: 'private',
        })
        .returning();
      createdArticleIds.push(art.id);

      // 5. Query usage
      const usage = await MediaService.getMediaUsage(OWNER_A_ID, mediaItem.id);
      expect(usage.totalReferences).toBe(3);
      expect(usage.publishedReferences).toBe(2); // Project & Cert are published+public; Article is draft

      const projRef = usage.references.find((r) => r.entityType === 'PROJECT');
      expect(projRef?.role).toBe('COVER');
      expect(projRef?.isPublished).toBe(true);

      const certRef = usage.references.find((r) => r.entityType === 'CERTIFICATE');
      expect(certRef?.role).toBe('EVIDENCE');
      expect(certRef?.isPublished).toBe(true);

      const artRef = usage.references.find((r) => r.entityType === 'ARTICLE');
      expect(artRef?.role).toBe('OG_IMAGE');
      expect(artRef?.isPublished).toBe(false);
    });
  });

  describe('4. Archive & Permanent Deletion Safety (Amendments 28, 30, 31, 57, 83)', () => {
    it('blocks archive if media is referenced by PUBLIC + PUBLISHED content (Amendment 28)', async () => {
      // 1. Create media
      const mediaItem = await MediaService.uploadMedia(
        OWNER_A_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'banner.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
        },
        OWNER_A_ID
      );
      createdMediaIds.push(mediaItem.id);

      // 2. Attach to published project
      const [proj] = await db
        .insert(projects)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Published Project with Banner',
          slug: 'published-proj-banner-test',
          description: 'Published description',
          publicationStatus: 'published',
          visibility: 'public',
        })
        .returning();
      createdProjectIds.push(proj.id);

      await db.insert(projectMedia).values({
        projectId: proj.id,
        mediaId: mediaItem.id,
        sortOrder: 0,
        isCover: true,
      });

      // 3. Attempt archive -> BLOCKED
      await expect(
        MediaService.archiveMedia(OWNER_A_ID, mediaItem.id, OWNER_A_ID)
      ).rejects.toThrow(/Cannot archive media because it is actively referenced by published public content/i);
    });

    it('allows archive when media has only draft or private references', async () => {
      // 1. Create media
      const mediaItem = await MediaService.uploadMedia(
        OWNER_A_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'draft_banner.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
        },
        OWNER_A_ID
      );
      createdMediaIds.push(mediaItem.id);

      // 2. Attach to draft project
      const [proj] = await db
        .insert(projects)
        .values({
          ownerId: OWNER_A_ID,
          title: 'Draft Project',
          slug: 'draft-proj-banner-test',
          description: 'Draft description',
          publicationStatus: 'draft',
          visibility: 'private',
        })
        .returning();
      createdProjectIds.push(proj.id);

      await db.insert(projectMedia).values({
        projectId: proj.id,
        mediaId: mediaItem.id,
        sortOrder: 0,
        isCover: true,
      });

      // 3. Archive succeeds
      const archived = await MediaService.archiveMedia(OWNER_A_ID, mediaItem.id, OWNER_A_ID);
      expect(archived.archivedAt).not.toBeNull();

      // 4. Restore succeeds
      const restored = await MediaService.restoreMedia(OWNER_A_ID, mediaItem.id, OWNER_A_ID);
      expect(restored.archivedAt).toBeNull();
    });

    it('requires asset to be archived and unreferenced before permanent delete (Amendments 30, 31)', async () => {
      const mediaItem = await MediaService.uploadMedia(
        OWNER_A_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'to_delete.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
        },
        OWNER_A_ID
      );

      // Active media cannot be permanently deleted
      await expect(
        MediaService.deleteMediaPermanently(OWNER_A_ID, mediaItem.id, OWNER_A_ID)
      ).rejects.toThrow(/It must be archived first/i);

      // Archive it
      await MediaService.archiveMedia(OWNER_A_ID, mediaItem.id, OWNER_A_ID);

      // Now permanent deletion succeeds
      await MediaService.deleteMediaPermanently(OWNER_A_ID, mediaItem.id, OWNER_A_ID);

      // Verify row is gone
      const check = await db.query.media.findFirst({ where: eq(media.id, mediaItem.id) });
      expect(check).toBeUndefined();
    });

    it('deleteMediaPermanently halts and preserves DB row if storage object deletion fails (Amendments 13, 31)', async () => {
      const mediaItem = await MediaService.uploadMedia(
        OWNER_A_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'storage_failure_test.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
        },
        OWNER_A_ID
      );
      createdMediaIds.push(mediaItem.id);

      await MediaService.archiveMedia(OWNER_A_ID, mediaItem.id, OWNER_A_ID);

      // Mock storage deletion failure
      vi.spyOn(StorageService, 'deleteObject').mockResolvedValueOnce({
        success: false,
        error: new Error('Simulated Storage Network Error'),
      });

      await expect(
        MediaService.deleteMediaPermanently(OWNER_A_ID, mediaItem.id, OWNER_A_ID)
      ).rejects.toThrow(/Failed to delete storage binary object/i);

      // Verify DB row was NOT deleted
      const check = await db.query.media.findFirst({ where: eq(media.id, mediaItem.id) });
      expect(check).toBeDefined();
    });
  });

  describe('5. Public Projection & Publishing Integration (Amendments 7, 34, 35, 40, 55, 86)', () => {
    it('public media projection contains only minimal public fields and no private paths or ownerId', async () => {
      const mediaItem = await MediaService.uploadMedia(
        OWNER_A_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'public_infographic.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
          altText: 'Detailed Architecture Diagram',
          visibility: 'public',
        },
        OWNER_A_ID
      );
      createdMediaIds.push(mediaItem.id);

      const publicDTO = await MediaService.getPublicMediaProjection(mediaItem.id);
      expect(publicDTO).not.toBeNull();
      expect(publicDTO?.url).toBeDefined();
      expect(publicDTO?.altText).toBe('Detailed Architecture Diagram');
      expect(publicDTO?.mimeType).toBe('image/png');

      // Negative security checks: Zero private metadata (Amendment 35, 86)
      expect((publicDTO as any).ownerId).toBeUndefined();
      expect((publicDTO as any).storageBucket).toBeUndefined();
      expect((publicDTO as any).storagePath).toBeUndefined();
      expect((publicDTO as any).disk).toBeUndefined();
      expect((publicDTO as any).uploadedBy).toBeUndefined();
    });

    it('private media returns isEligible=false for public projection without mutating media state (Amendment 7, 55)', async () => {
      const privateMedia = await MediaService.uploadMedia(
        OWNER_A_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'internal_secret_diagram.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
          visibility: 'private',
        },
        OWNER_A_ID
      );
      createdMediaIds.push(privateMedia.id);

      const validation = await MediaService.validateMediaForPublicProjection(privateMedia.id);
      expect(validation.isEligible).toBe(false);
      expect(validation.issue?.code).toBe('MEDIA_PRIVATE');

      // Verify media row remains private (Amendment 7: Content publication does NOT mutate media)
      const freshMedia = await db.query.media.findFirst({ where: eq(media.id, privateMedia.id) });
      expect(freshMedia?.visibility).toBe('private');
    });
  });

  describe('6. Non-Destructive Health Diagnostics (Amendments 38, 39, 41, 42)', () => {
    it('identifies unused assets and public images missing alt text with stable codes', async () => {
      // 1. Upload unreferenced image with missing alt text
      const unusedAsset = await MediaService.uploadMedia(
        OWNER_A_ID,
        {
          file: VALID_PNG_BUFFER,
          originalName: 'lonely_asset.png',
          mimeType: 'image/png',
          sizeBytes: VALID_PNG_BUFFER.length,
          visibility: 'public',
        },
        OWNER_A_ID
      );
      createdMediaIds.push(unusedAsset.id);

      const diagnostics = await MediaService.getMediaHealthDiagnostics(OWNER_A_ID);
      expect(diagnostics.totalAssets).toBeGreaterThanOrEqual(1);

      // Verify UNUSED code
      const unusedIssue = diagnostics.issues.find(
        (i) => i.mediaId === unusedAsset.id && i.code === 'MEDIA_UNUSED'
      );
      expect(unusedIssue).toBeDefined();
      expect(unusedIssue?.severity).toBe('info');
    });
  });
});
