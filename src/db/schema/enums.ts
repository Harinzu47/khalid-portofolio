import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Shared PostgreSQL Enums for Canonical State Machines
 * per HZCODE Database Domain Model v1 & Publishing Model v1
 */

export const visibilityEnum = pgEnum('visibility_status', ['private', 'unlisted', 'public']);

export const publicationStatusEnum = pgEnum('publication_status', [
  'draft',
  'review',
  'scheduled',
  'published',
  'archived',
]);

export const projectStatusEnum = pgEnum('project_status', [
  'idea',
  'planning',
  'active',
  'maintained',
  'completed',
  'archived',
  'experimental',
]);

export const nowEntryTypeEnum = pgEnum('now_entry_type', [
  'building',
  'learning',
  'managing',
  'researching',
  'reading',
  'watching',
  'exploring',
  'using',
]);

export const nowEntryStatusEnum = pgEnum('now_entry_status', [
  'active',
  'idle',
  'completed',
  'archived',
]);

export const adrStatusEnum = pgEnum('adr_status', [
  'proposed',
  'accepted',
  'superseded',
  'rejected',
  'deprecated',
]);

export const learningStatusEnum = pgEnum('learning_status', [
  'planned',
  'active',
  'paused',
  'completed',
  'archived',
]);
