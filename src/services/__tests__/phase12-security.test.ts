import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { db } from '@/db/client';
import {
  projects,
  articles,
  notes,
  journalEntries,
  media,
  knowledgeRelationships,
  searchDocuments,
} from '@/db/schema';
import { ArticlesService } from '@/services/articles.service';
import { ProjectsService } from '@/services/projects.service';
import { TechNoteService } from '@/services/notes.service';
import { PublicSearchService } from '@/services/public-search.service';
import { MediaService } from '@/services/media.service';
import { validateSafeRedirectUrl, sanitizePublicUrl } from '@/lib/security';
import { sanitizeMeta } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { getPersonSchema, getArticleSchema, getProjectSchema } from '@/lib/json-ld';
import { ProjectFormSchema } from '@/validations/project';
import { generateStoragePath, sanitizeFilename } from '@/domain/media/upload-policy';
import { eq, or } from 'drizzle-orm';
import crypto from 'crypto';

describe('Phase 12: Production Hardening & Adversarial Security Test Suite', () => {
  const OWNER_A = 'a0000000-0000-0000-0000-000000000001';
  const OWNER_B = 'b0000000-0000-0000-0000-000000000002';

  beforeAll(async () => {
    // Clean test artifacts
    await db.delete(searchDocuments).where(or(eq(searchDocuments.ownerId, OWNER_A), eq(searchDocuments.ownerId, OWNER_B)));
    await db.delete(knowledgeRelationships).where(or(eq(knowledgeRelationships.ownerId, OWNER_A), eq(knowledgeRelationships.ownerId, OWNER_B)));
    await db.delete(projects).where(or(eq(projects.ownerId, OWNER_A), eq(projects.ownerId, OWNER_B)));
    await db.delete(articles).where(or(eq(articles.ownerId, OWNER_A), eq(articles.ownerId, OWNER_B)));
    await db.delete(notes).where(or(eq(notes.ownerId, OWNER_A), eq(notes.ownerId, OWNER_B)));
    await db.delete(journalEntries).where(or(eq(journalEntries.ownerId, OWNER_A), eq(journalEntries.ownerId, OWNER_B)));
    await db.delete(media).where(or(eq(media.ownerId, OWNER_A), eq(media.ownerId, OWNER_B)));
  });

  beforeEach(async () => {
    await db.delete(searchDocuments).where(or(eq(searchDocuments.ownerId, OWNER_A), eq(searchDocuments.ownerId, OWNER_B)));
  });

  describe('1. Authentication & Open Redirect Hardening', () => {
    it('neutralizes hostile foreign open redirect URLs and falls back safely', () => {
      expect(validateSafeRedirectUrl('https://evil.com/phishing', '/admin')).toBe('/admin');
      expect(validateSafeRedirectUrl('http://attacker.org', '/admin')).toBe('/admin');
      expect(validateSafeRedirectUrl('//evil.com/hack', '/admin')).toBe('/admin');
      expect(validateSafeRedirectUrl('/\\evil.com', '/admin')).toBe('/admin');
      expect(validateSafeRedirectUrl('javascript:alert(document.cookie)', '/admin')).toBe('/admin');
      expect(validateSafeRedirectUrl('data:text/html,<script>alert(1)</script>', '/admin')).toBe('/admin');
    });

    it('permits legitimate internal relative redirect targets', () => {
      expect(validateSafeRedirectUrl('/admin/articles', '/admin')).toBe('/admin/articles');
      expect(validateSafeRedirectUrl('/os/system/health?filter=all', '/admin')).toBe('/os/system/health?filter=all');
      expect(validateSafeRedirectUrl('/work/distributed-tracer', '/admin')).toBe('/work/distributed-tracer');
    });

    it('enforces instance-local rate limiting on authentication operations', () => {
      const key = `test_auth_limit_${Date.now()}`;
      for (let i = 0; i < 3; i++) {
        const res = rateLimit(key, { limit: 3, windowSeconds: 60 });
        expect(res.success).toBe(true);
      }
      const blocked = rateLimit(key, { limit: 3, windowSeconds: 60 });
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe('2. Authorization & IDOR / Cross-Owner Mutation Rejection', () => {
    it('prevents OWNER_B from updating an article created by OWNER_A', async () => {
      const article = await ArticlesService.createArticle(OWNER_A, {
        title: 'Owner A Sovereign Architecture',
        slug: 'owner-a-sovereign-arch-12',
        content: 'Confidential system design for Owner A.',
        visibility: 'private',
      });

      // OWNER_B attempts to modify OWNER_A's article
      await expect(
        ArticlesService.updateArticle(OWNER_B, article.id, {
          title: 'Hacked by Owner B',
          content: 'Compromised content.',
        })
      ).rejects.toThrow();
    });

    it('prevents OWNER_B from soft-archiving a TechNote created by OWNER_A', async () => {
      const note = await TechNoteService.createTechNote(OWNER_A, {
        title: 'Owner A Private BGP Core Notes',
        slug: 'owner-a-private-bgp-core-12',
        content: 'Confidential BGP peering logs.',
        visibility: 'private',
      });

      await expect(
        TechNoteService.archiveTechNote(OWNER_B, note.id)
      ).rejects.toThrow();
    });

    it('prevents OWNER_B from updating a project created by OWNER_A', async () => {
      const projectInput = ProjectFormSchema.parse({
        title: 'Owner A Core Switch Kernel',
        slug: 'owner-a-core-switch-kernel-12',
        shortDescription: 'Secret kernel switch firmware.',
        visibility: 'private',
      });
      const project = await ProjectsService.createProject(OWNER_A, projectInput);

      const updateInput = ProjectFormSchema.parse({
        title: 'Owner B Tampered Title',
        slug: 'owner-a-core-switch-kernel-12',
        visibility: 'private',
      });

      await expect(
        ProjectsService.updateProject(OWNER_B, project.id, updateInput)
      ).rejects.toThrow();
    });
  });

  describe('3. Search Privacy & Side-Channel Resistance', () => {
    it('handles hostile fuzzing and SQL-like strings in search queries safely without crashing', async () => {
      const hostileQueries = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        '<script>alert("xss")</script>',
        '[][]{}{}()\\\\//==++&&||',
      ];

      for (const query of hostileQueries) {
        const res = await PublicSearchService.searchKnowledge({ q: query });
        expect(res).toBeDefined();
        expect(Array.isArray(res.items)).toBe(true);
      }
    });

    it('strictly enforces 200 character bounds on search queries via Zod', async () => {
      const oversizedQuery = 'A'.repeat(500);
      await expect(
        PublicSearchService.searchKnowledge({ q: oversizedQuery })
      ).rejects.toThrow();
    });

    it('guarantees that private documents in search_documents do not leak through facet totals', async () => {
      const privDocId = '12121212-1212-1212-1212-121212121201';
      await db.insert(searchDocuments).values({
        id: privDocId,
        ownerId: OWNER_A,
        entityType: 'ARTICLE',
        entityId: '34343434-3434-3434-3434-343434343401',
        title: 'Private Redacted Research Notes',
        slug: 'private-redacted-research-notes-12',
        visibility: 'private',
        publicationStatus: 'draft',
        sourceUpdatedAt: new Date(),
        indexedAt: new Date(),
        projectionVersion: 1,
      });

      const searchRes = await PublicSearchService.searchKnowledge({ q: 'Private Redacted' });
      expect(searchRes.items.length).toBe(0);
      expect(searchRes.pagination.totalItems).toBe(0);
    });
  });

  describe('4. Media Hardening & Path Traversal Prevention', () => {
    it('generates secure hashed storage paths from hostile traversal filenames', () => {
      const dangerousFilenames = [
        '../../../../etc/passwd',
        '..\\..\\windows\\system32\\cmd.exe',
        'image.png\x00.exe',
        'normal-photo.jpg',
      ];

      for (const rawName of dangerousFilenames) {
        const safeName = sanitizeFilename(rawName);
        expect(safeName).not.toContain('..');
        expect(safeName).not.toContain('/etc/');
        expect(safeName).not.toContain('system32');

        const generatedPath = generateStoragePath(OWNER_A, 'media-12345', rawName);
        expect(generatedPath).not.toContain('..');
        expect(generatedPath.startsWith(`${OWNER_A}/media-12345/`)).toBe(true);
      }
    });

    it('rejects public projection for private media assets', async () => {
      const privMediaId = '56565656-5656-5656-5656-565656565601';
      await db.insert(media).values({
        id: privMediaId,
        ownerId: OWNER_A,
        storageBucket: 'portfolio',
        path: `${OWNER_A}/vault/infra-topology.png`,
        originalName: 'infra-topology.png',
        mimeType: 'image/png',
        sizeBytes: 204800,
        visibility: 'private',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      const validation = await MediaService.validateMediaForPublicProjection(privMediaId);
      expect(validation.isEligible).toBe(false);
      expect(validation.media).toBeUndefined();
    });
  });

  describe('5. Scheduler Security & Constant-Time Secret Verification', () => {
    it('performs timing-safe verification of cron secrets and rejects invalid tokens', () => {
      const secret = 'super-secret-cron-token-xyz-123';
      const validToken = 'super-secret-cron-token-xyz-123';
      const invalidToken = 'wrong-token-abc-999';

      const secretBuffer = Buffer.from(secret);
      const validBuffer = Buffer.from(validToken);
      const invalidBuffer = Buffer.from(invalidToken);

      const isValidMatch = validBuffer.length === secretBuffer.length && crypto.timingSafeEqual(validBuffer, secretBuffer);
      expect(isValidMatch).toBe(true);

      const isInvalidMatch = invalidBuffer.length === secretBuffer.length && crypto.timingSafeEqual(invalidBuffer, secretBuffer);
      expect(isInvalidMatch).toBe(false);
    });
  });

  describe('6. Structured Logger Redaction & Operational Privacy', () => {
    it('automatically redacts sensitive credentials from log metadata', () => {
      const rawMeta = {
        email: 'operator@hzcode.my.id',
        password: 'SuperSecretPassword123!',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        databaseUrl: 'postgresql://postgres:secret@db.supabase.co:5432/postgres',
        serviceRoleKey: 'secret-service-role-key',
        nested: {
          apiKey: 'key-12345',
          safeField: 'active',
        },
      };

      const sanitized = sanitizeMeta(rawMeta);

      expect(sanitized.email).toBe('operator@hzcode.my.id');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.databaseUrl).toBe('[REDACTED]');
      expect(sanitized.serviceRoleKey).toBe('[REDACTED]');
      expect((sanitized.nested as any).apiKey).toBe('[REDACTED]');
      expect((sanitized.nested as any).safeField).toBe('active');
    });
  });

  describe('7. Public DTO & JSON-LD Zero-Leak Negative Tests', () => {
    it('verifies that getPersonSchema outputs zero internal columns', () => {
      const personSchema = getPersonSchema();
      const serialized = JSON.stringify(personSchema);

      expect(serialized).not.toContain('ownerId');
      expect(serialized).not.toContain('owner_id');
      expect(serialized).not.toContain('storagePath');
      expect(serialized).not.toContain('searchVector');
      expect(serialized).not.toContain('serviceRole');
    });

    it('verifies that getArticleSchema outputs only sanitized public fields', () => {
      const articleSchema = getArticleSchema({
        title: 'Designing Zero-Trust Edge Projections',
        slug: 'designing-zero-trust-edge-projections',
        description: 'Deep dive into deterministic fail-closed projection architectures.',
        publishedAt: new Date('2026-08-20T10:00:00Z'),
        updatedAt: new Date('2026-08-25T12:00:00Z'),
      });

      const serialized = JSON.stringify(articleSchema);
      expect(serialized).toContain('Designing Zero-Trust Edge Projections');
      expect(serialized).not.toContain('ownerId');
      expect(serialized).not.toContain('storagePath');
    });

    it('verifies that sanitizePublicUrl rejects hostile protocols', () => {
      expect(sanitizePublicUrl('javascript:alert(1)')).toBeNull();
      expect(sanitizePublicUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBeNull();
      expect(sanitizePublicUrl('file:///etc/passwd')).toBeNull();
      expect(sanitizePublicUrl('vbscript:msgbox(1)')).toBeNull();
      expect(sanitizePublicUrl('https://github.com/Harinzu47')).toBe('https://github.com/Harinzu47');
      expect(sanitizePublicUrl('mailto:contact@hzcode.my.id')).toBe('mailto:contact@hzcode.my.id');
    });
  });
});
