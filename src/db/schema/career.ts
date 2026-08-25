import { pgTable, uuid, varchar, text, timestamp, integer, boolean, date, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * 10.3 organizations — Companies, clients, institutions
 */
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).unique().notNull(),
  description: text('description'),
  websiteUrl: text('website_url'),
  logoPath: text('logo_path'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

/**
 * 10.4 career_experiences — Professional roles & history
 */
export const careerExperiences = pgTable(
  'career_experiences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    position: varchar('position', { length: 200 }).notNull(),
    employmentType: varchar('employment_type', { length: 50 }),
    location: varchar('location', { length: 150 }),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    endDate: date('end_date', { mode: 'string' }),
    description: text('description'),
    isCurrent: boolean('is_current').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
  },
  (t) => [
    check('chk_career_dates', sql`${t.endDate} IS NULL OR ${t.endDate} >= ${t.startDate}`),
    index('idx_career_start_date').on(t.startDate),
  ]
);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type CareerExperience = typeof careerExperiences.$inferSelect;
export type NewCareerExperience = typeof careerExperiences.$inferInsert;
