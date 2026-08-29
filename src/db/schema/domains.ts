import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { skills } from './projects';

/**
 * 10.26 domains — Broad technical and architectural capability areas
 * Canonical Entity: Domain
 */
export const domains = pgTable(
  'domains',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 120 }).unique().notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').default(0).notNull(),
    visibility: varchar('visibility', { length: 30 }).default('private').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    index('idx_domains_slug').on(t.slug),
    index('idx_domains_visibility').on(t.visibility),
  ]
);

/**
 * 10.27 domain_skills — Domain to Skill junction
 */
export const domainSkills = pgTable(
  'domain_skills',
  {
    domainId: uuid('domain_id')
      .notNull()
      .references(() => domains.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.domainId, t.skillId] }),
  ]
);

export type Domain = typeof domains.$inferSelect;
export type NewDomain = typeof domains.$inferInsert;
export type DomainSkill = typeof domainSkills.$inferSelect;
export type NewDomainSkill = typeof domainSkills.$inferInsert;
