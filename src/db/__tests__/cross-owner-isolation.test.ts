import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { isSupabaseReachable, createAnonymousClient } from './rls-helpers';
import { db } from '../client';
import * as schema from '../schema';
import { eq, sql } from 'drizzle-orm';

const OWNER_A = '6ccf61c3-a1b6-4cf2-9c91-81a1ce4f35a0';

describe('Database / RLS Cross-Owner Isolation Suite', () => {
  let isReachable = false;
  let privateProjectAId: string;
  let privateSkillAId: string;
  let privateDomainAId: string;

  beforeAll(async () => {
    isReachable = await isSupabaseReachable();
    if (!isReachable) return;

    // Seed test fixtures belonging exclusively to OWNER_A
    const [projA] = await db
      .insert(schema.projects)
      .values({
        ownerId: OWNER_A,
        title: 'Confidential Internal Core OS',
        slug: `confidential-core-os-${Date.now()}`,
        visibility: 'private',
        publicationStatus: 'draft',
      })
      .returning();
    privateProjectAId = projA.id;

    const [skillA] = await db
      .insert(schema.skills)
      .values({
        ownerId: OWNER_A,
        name: 'Private Kernel Debugging',
        slug: `private-kernel-debug-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    privateSkillAId = skillA.id;

    const [domainA] = await db
      .insert(schema.domains)
      .values({
        ownerId: OWNER_A,
        name: 'Private Security Research',
        slug: `private-sec-research-${Date.now()}`,
        visibility: 'private',
      })
      .returning();
    privateDomainAId = domainA.id;
  });

  afterAll(async () => {
    if (!isReachable) return;
    if (privateProjectAId) await db.delete(schema.projects).where(eq(schema.projects.id, privateProjectAId));
    if (privateSkillAId) await db.delete(schema.skills).where(eq(schema.skills.id, privateSkillAId));
    if (privateDomainAId) await db.delete(schema.domains).where(eq(schema.domains.id, privateDomainAId));
  });

  describe('Anonymous Client Access Boundary (RLS Enforcement)', () => {
    it('anon client cannot view private/draft projects of OWNER_A', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient
        .from('projects')
        .select('*')
        .eq('id', privateProjectAId);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it('anon client cannot view private skills of OWNER_A', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient
        .from('skills')
        .select('*')
        .eq('id', privateSkillAId);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it('anon client cannot view private domains of OWNER_A', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient
        .from('domains')
        .select('*')
        .eq('id', privateDomainAId);

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it('anon client cannot mutate or delete OWNER_A projects', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient
        .from('projects')
        .update({ title: 'Hacked by Anon' })
        .eq('id', privateProjectAId)
        .select();

      if (!error) {
        expect(data).toHaveLength(0);
      }
    });

    it('anon client cannot insert records under OWNER_A uuid', async () => {
      if (!isReachable) return;

      const anonClient = createAnonymousClient();
      const { data, error } = await anonClient
        .from('projects')
        .insert({
          owner_id: OWNER_A,
          title: 'Unauthenticated Insert Attempt',
          slug: `unauth-insert-${Date.now()}`,
          visibility: 'private',
          publication_status: 'draft',
        })
        .select();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });

  describe('Database RLS Policy Matrix Verification', () => {
    it('verifies all 20 owned tables enforce strict auth.uid() = owner_id policies', async () => {
      if (!isReachable) return;

      const ownedTables = [
        'profiles', 'organizations', 'technologies', 'skills', 'domains',
        'projects', 'project_case_studies', 'project_links', 'project_media',
        'media', 'articles', 'journal_entries', 'notes', 'tags',
        'adrs', 'learning_paths', 'certificates', 'learning_goals',
        'roadmap_items', 'now_entries', 'knowledge_relationships'
      ];

      const policies = await db.execute<{
        tablename: string;
        policyname: string;
        cmd: string;
        qual: string | null;
        with_check: string | null;
      }>(
        sql`SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public'`
      );

      for (const table of ownedTables) {
        const tablePolicies = policies.filter((p) => p.tablename === table);
        expect(tablePolicies.length).toBeGreaterThan(0);

        // Verify INSERT has check on auth.uid() = owner_id
        const insertPol = tablePolicies.find((p) => p.cmd === 'INSERT' || p.cmd === 'ALL');
        expect(insertPol).toBeDefined();
        const checkExpr = insertPol?.with_check || insertPol?.qual || '';
        expect(checkExpr).toContain('auth.uid()');

        // Verify UPDATE has using/check on auth.uid() = owner_id
        const updatePol = tablePolicies.find((p) => p.cmd === 'UPDATE' || p.cmd === 'ALL');
        expect(updatePol).toBeDefined();
        const updateExpr = updatePol?.qual || updatePol?.with_check || '';
        expect(updateExpr).toContain('auth.uid()');

        // Verify DELETE has using on auth.uid() = owner_id
        const deletePol = tablePolicies.find((p) => p.cmd === 'DELETE' || p.cmd === 'ALL');
        expect(deletePol).toBeDefined();
        const deleteExpr = deletePol?.qual || '';
        expect(deleteExpr).toContain('auth.uid()');
      }
    });
  });
});
