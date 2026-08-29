import { pgTable, uuid, varchar, text, timestamp, integer, boolean, unique, jsonb } from 'drizzle-orm/pg-core';

/**
 * 10.1 profiles — Central operator profile & identity
 * Canonical Entity: Profile
 */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  headline: varchar('headline', { length: 255 }),
  bio: text('bio'),
  avatarPath: text('avatar_path'),
  location: varchar('location', { length: 150 }),
  timezone: varchar('timezone', { length: 100 }),
  availabilityStatus: varchar('availability_status', { length: 100 }),
  emailPublic: varchar('email_public', { length: 150 }),
  websiteUrl: text('website_url'),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  resumePath: text('resume_path'),
  contactEnabled: boolean('contact_enabled').default(true).notNull(),
  principles: jsonb('principles'),
  workingModes: jsonb('working_modes'),
  curiosities: jsonb('curiosities'),
  manifestLines: jsonb('manifest_lines'),
  visibility: varchar('visibility', { length: 30 }).default('public').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

/**
 * 10.2 social_links — External channels & profiles
 */
export const socialLinks = pgTable(
  'social_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    platform: varchar('platform', { length: 50 }).notNull(),
    label: varchar('label', { length: 100 }),
    url: text('url').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isVisible: boolean('is_visible').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    unique('uq_profile_platform').on(t.profileId, t.platform),
  ]
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type SocialLink = typeof socialLinks.$inferSelect;
export type NewSocialLink = typeof socialLinks.$inferInsert;
