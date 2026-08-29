import type { PublicationStatus } from './publication-statuses';
import type { PublishableEntityCapability } from './entity-registry';

/**
 * Controlled Publishing Lifecycle Commands (Amendments 15, 23, 48).
 */
export const PUBLISHING_COMMANDS = [
  'SUBMIT_FOR_REVIEW',
  'RETURN_TO_DRAFT',
  'SCHEDULE',
  'PUBLISH_NOW',
  'UNPUBLISH',
  'ARCHIVE',
  'RESTORE',
  'CHANGE_VISIBILITY',
] as const;

export type PublishingCommand = (typeof PUBLISHING_COMMANDS)[number];

export interface StatusTransitionRule {
  command: PublishingCommand;
  allowedFromStatuses: readonly PublicationStatus[];
  targetStatus: PublicationStatus;
  requiresFullReadiness: boolean;
  requiresBasicReadiness: boolean;
  isIdempotentWhenAlreadyTarget: boolean;
}

export const STATUS_TRANSITION_RULES: Record<
  Exclude<PublishingCommand, 'CHANGE_VISIBILITY'>,
  StatusTransitionRule
> = {
  SUBMIT_FOR_REVIEW: {
    command: 'SUBMIT_FOR_REVIEW',
    allowedFromStatuses: ['draft'],
    targetStatus: 'review',
    requiresFullReadiness: false,
    requiresBasicReadiness: true, // Amendment 16: basic readiness for review
    isIdempotentWhenAlreadyTarget: true,
  },
  RETURN_TO_DRAFT: {
    command: 'RETURN_TO_DRAFT',
    allowedFromStatuses: ['review', 'scheduled', 'published'],
    targetStatus: 'draft',
    requiresFullReadiness: false,
    requiresBasicReadiness: false,
    isIdempotentWhenAlreadyTarget: true,
  },
  SCHEDULE: {
    command: 'SCHEDULE',
    allowedFromStatuses: ['draft', 'review', 'scheduled'],
    targetStatus: 'scheduled',
    requiresFullReadiness: true, // Amendment 17: full readiness at schedule time
    requiresBasicReadiness: true,
    isIdempotentWhenAlreadyTarget: true,
  },
  PUBLISH_NOW: {
    command: 'PUBLISH_NOW',
    allowedFromStatuses: ['draft', 'review', 'scheduled', 'published'], // Amendment 15: direct publish from draft allowed
    targetStatus: 'published',
    requiresFullReadiness: true,
    requiresBasicReadiness: true,
    isIdempotentWhenAlreadyTarget: true, // Amendment 24: publish on published returns current
  },
  UNPUBLISH: {
    command: 'UNPUBLISH',
    allowedFromStatuses: ['published'],
    targetStatus: 'draft',
    requiresFullReadiness: false,
    requiresBasicReadiness: false,
    isIdempotentWhenAlreadyTarget: false,
  },
  ARCHIVE: {
    command: 'ARCHIVE',
    allowedFromStatuses: ['draft', 'review', 'scheduled', 'published', 'archived'],
    targetStatus: 'archived',
    requiresFullReadiness: false,
    requiresBasicReadiness: false,
    isIdempotentWhenAlreadyTarget: true,
  },
  RESTORE: {
    command: 'RESTORE',
    allowedFromStatuses: ['archived'],
    targetStatus: 'draft', // Amendment 27: restore from archived NEVER auto-publishes
    requiresFullReadiness: false,
    requiresBasicReadiness: false,
    isIdempotentWhenAlreadyTarget: false,
  },
};

/**
 * Returns allowed commands for a given publication status and entity capability (Amendment 48).
 * Consumed by UI components so UI buttons never drift from domain policy.
 */
export function getAllowedCommandsForStatus(
  currentStatus: PublicationStatus,
  capability?: PublishableEntityCapability
): PublishingCommand[] {
  const commands: PublishingCommand[] = ['CHANGE_VISIBILITY'];

  if (currentStatus === 'draft') {
    if (capability?.supportsReview) {
      commands.push('SUBMIT_FOR_REVIEW');
    }
    if (capability?.supportsScheduling) {
      commands.push('SCHEDULE');
    }
    commands.push('PUBLISH_NOW', 'ARCHIVE');
  } else if (currentStatus === 'review') {
    commands.push('RETURN_TO_DRAFT');
    if (capability?.supportsScheduling) {
      commands.push('SCHEDULE');
    }
    commands.push('PUBLISH_NOW', 'ARCHIVE');
  } else if (currentStatus === 'scheduled') {
    commands.push('RETURN_TO_DRAFT', 'SCHEDULE', 'PUBLISH_NOW', 'ARCHIVE');
  } else if (currentStatus === 'published') {
    commands.push('UNPUBLISH', 'ARCHIVE');
  } else if (currentStatus === 'archived') {
    commands.push('RESTORE');
  }

  return commands;
}

/**
 * Evaluates whether a requested transition is valid according to canonical transition rules.
 */
export function isValidStatusTransition(
  currentStatus: PublicationStatus,
  command: PublishingCommand,
  capability?: PublishableEntityCapability
): boolean {
  if (command === 'CHANGE_VISIBILITY') return true;

  if (command === 'SUBMIT_FOR_REVIEW' && capability && !capability.supportsReview) {
    return false;
  }
  if (command === 'SCHEDULE' && capability && !capability.supportsScheduling) {
    return false;
  }

  const rule = STATUS_TRANSITION_RULES[command];
  if (!rule) return false;

  return (rule.allowedFromStatuses as readonly string[]).includes(currentStatus);
}
