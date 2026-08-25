import { describe, it, expect } from 'vitest';
import {
  ArticleFormSchema,
  ProjectFormSchema,
  JournalFormSchema,
  SkillFormSchema,
  TechnologyFormSchema,
  LoginSchema,
  ProfileFormSchema,
} from '@/validations';

describe('Validation Schemas Suite', () => {
  describe('LoginSchema', () => {
    it('accepts valid credentials', () => {
      const res = LoginSchema.safeParse({
        email: 'operator@hzcode.my.id',
        password: 'SuperSecretPassword123!',
      });
      expect(res.success).toBe(true);
    });

    it('rejects malformed email', () => {
      const res = LoginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(res.success).toBe(false);
    });

    it('rejects short passwords', () => {
      const res = LoginSchema.safeParse({
        email: 'operator@hzcode.my.id',
        password: '123',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('ArticleFormSchema', () => {
    it('validates a valid article payload', () => {
      const res = ArticleFormSchema.safeParse({
        title: 'High-Throughput PostgreSQL Indexing Strategies',
        slug: 'high-throughput-postgres-indexing',
        summary: 'Deep dive into composite keys, partial indexes, and heap access optimization.',
        content: '# Introduction\nPostgres indexes are foundational...',
        category: 'backend',
        status: 'published',
        featured: true,
      });
      expect(res.success).toBe(true);
    });

    it('rejects invalid slugs with uppercase or special symbols', () => {
      const res = ArticleFormSchema.safeParse({
        title: 'Title',
        slug: 'Invalid Slug with Spaces!',
        summary: 'Summary with enough characters here...',
        content: 'Content here...',
        category: 'backend',
        status: 'draft',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('ProjectFormSchema', () => {
    it('validates a complete project payload', () => {
      const res = ProjectFormSchema.safeParse({
        title: 'AturModal ERP Engine',
        slug: 'atur-modal-erp',
        shortDescription: 'Microfinance enterprise ledger with atomic ledger auditing.',
        status: 'completed',
        role: 'Lead Systems Architect',
        featured: true,
      });
      expect(res.success).toBe(true);
    });
  });

  describe('JournalFormSchema', () => {
    it('validates an engineering journal log', () => {
      const res = JournalFormSchema.safeParse({
        title: 'Investigating BGP Peering Flaps in MikroTik CHR',
        slug: 'bgp-peering-flaps-chr',
        content: 'Detailed diagnostic steps and firewall filter adjustments...',
        entryDate: '2026-08-25',
        visibility: 'public',
      });
      expect(res.success).toBe(true);
    });
  });

  describe('SkillFormSchema', () => {
    it('enforces proficiency range between 1 and 5', () => {
      const valid = SkillFormSchema.safeParse({
        name: 'MikroTik RouterOS',
        category: 'Networking',
        proficiencyLevel: 5,
      });
      expect(valid.success).toBe(true);

      const invalid = SkillFormSchema.safeParse({
        name: 'MikroTik RouterOS',
        category: 'Networking',
        proficiencyLevel: 10,
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('TechnologyFormSchema', () => {
    it('validates technology taxonomies', () => {
      const res = TechnologyFormSchema.safeParse({
        name: 'Docker',
        slug: 'docker',
        category: 'DevOps',
        websiteUrl: 'https://www.docker.com',
      });
      expect(res.success).toBe(true);
    });
  });

  describe('ProfileFormSchema', () => {
    it('validates operator profile updates', () => {
      const res = ProfileFormSchema.safeParse({
        fullName: 'Khalid Jundullah',
        username: 'harinzu',
        headline: 'Network & Infrastructure Engineer → Fullstack Dev',
        websiteUrl: 'https://hzcode.my.id',
      });
      expect(res.success).toBe(true);
    });
  });
});
