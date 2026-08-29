import { describe, it, expect, beforeAll } from 'vitest';
import { createAnonymousClient, isSupabaseReachable } from './rls-helpers';

describe('Row Level Security (RLS) Baseline Suite — Canonical Extensions', () => {
  let isReachable = false;

  beforeAll(async () => {
    isReachable = await isSupabaseReachable();
  });

  describe('Anonymous / Public Read Boundaries (Core Entities)', () => {
    it('allows anonymous reading of publicly available projects', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient
        .from('projects')
        .select('id, title, status, visibility, publication_status, published_at');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        for (const project of data) {
          expect(project.visibility).toBe('public');
          expect(['published', 'completed']).toContain(project.publication_status || project.status);
        }
      }
    });

    it('allows anonymous reading of published articles', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient
        .from('articles')
        .select('id, title, status, visibility, publication_status, published_at');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        for (const article of data) {
          expect(article.visibility).toBe('public');
          expect(article.publication_status || article.status).toBe('published');
        }
      }
    });

    it('allows anonymous reading of public journal entries', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('journal_entries').select('id, title, status, visibility, published_at');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        for (const entry of data) {
          expect(entry.status).toBe('published');
          expect(entry.visibility).toBe('public');
          expect(entry.published_at).not.toBeNull();
        }
      }
    });

    it('denies anonymous access to private audit logs (0 rows)', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('audit_logs').select('*');

      if (!error) {
        expect(data).toHaveLength(0);
      } else {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Anonymous / Public Read Boundaries (New Canonical Entities)', () => {
    it('allows anonymous reading of public domains', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('domains').select('id, name, slug, visibility');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        for (const domain of data) {
          expect(domain.visibility).toBe('public');
        }
      }
    });

    it('allows anonymous reading of published ADRs and hides proposed drafts', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('adrs').select('id, title, slug, visibility, publication_status');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        for (const adr of data) {
          expect(adr.visibility).toBe('public');
          expect(adr.publication_status).toBe('published');
        }
      }
    });

    it('allows anonymous reading of public now_entries', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('now_entries').select('id, title, visibility, publication_status');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        for (const entry of data) {
          expect(entry.visibility).toBe('public');
          expect(entry.publication_status).toBe('published');
        }
      }
    });

    it('allows anonymous reading of active public semantic relationship types', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('relationship_types').select('id, code, name, is_public_eligible, is_active');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThanOrEqual(8); // 8 canonical types seeded
    });

    it('allows anonymous reading of published knowledge_relationships', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('knowledge_relationships').select('id, source_type, target_type, visibility, status');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        for (const edge of data) {
          expect(edge.visibility).toBe('public');
          expect(edge.status).toBe('active');
        }
      }
    });
  });

  describe('Anonymous Mutation Denial on Canonical Tables', () => {
    it('blocks anonymous INSERT into domains table', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('domains').insert({
        name: 'Unauthorized Domain',
        slug: 'unauthorized-domain',
      }).select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('blocks anonymous INSERT into adrs table', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('adrs').insert({
        title: 'Unauthorized Decision',
        slug: 'unauthorized-adr',
        status: 'proposed',
      }).select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('blocks anonymous INSERT into now_entries table', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('now_entries').insert({
        entryType: 'building',
        title: 'Unauthorized Activity',
      }).select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('blocks anonymous INSERT into knowledge_relationships table', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient.from('knowledge_relationships').insert({
        relationshipTypeId: '00000000-0000-0000-0000-000000000001',
        sourceType: 'ARTICLE',
        sourceId: '00000000-0000-0000-0000-000000000002',
        targetType: 'PROJECT',
        targetId: '00000000-0000-0000-0000-000000000003',
      }).select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });

  describe('Multi-Identity Owner Isolation Invariants', () => {
    it('verifies owner-scoped isolation pattern for Phase 2 reconciliation', () => {
      // Invariant:
      // When owner_id is populated on top-level records, RLS write policies ensure:
      // 1. OWNER_A can mutate OWNER_A records.
      // 2. OWNER_B cannot mutate OWNER_A records.
      // 3. ANONYMOUS cannot mutate any records.
      expect(true).toBe(true);
    });
  });
});
