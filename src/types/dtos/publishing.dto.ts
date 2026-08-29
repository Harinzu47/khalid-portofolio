import type {
  PublishableEntityType,
  PublicationStatus,
  Visibility,
  PublishingCommand,
} from '@/domain/publishing';

export interface PublicationIssueDTO {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

export interface PublicationReadinessDTO {
  isReady: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  issues: PublicationIssueDTO[];
  checkedAt: string;
}

export interface PublicImpactPreviewDTO {
  entityType: PublishableEntityType;
  entityId: string;
  entityTitle: string;
  slug: string | null;
  currentVisibility: Visibility;
  targetVisibility: Visibility;
  currentPublicationStatus: PublicationStatus;
  targetPublicationStatus: PublicationStatus;
  publicRoute: string | null;
  isNewlyDiscoverable: boolean;
  isDirectlyAccessible: boolean;
  eligibleRelationshipsCount: number;
  eligibleRelationships: Array<{
    id: string;
    relationshipTypeCode: string;
    relationshipTypeName: string;
    targetLabel: string;
    targetType: string;
  }>;
  hiddenPrivateRelationshipsCount: number;
  mediaImpact: {
    totalMediaCount: number;
    referencedPublicly: boolean;
  };
  sitemapImpact: boolean;
  searchImpact: {
    isEligibleForFutureSearch: boolean;
  };
  warnings: string[];
}

export interface PublicationStateDTO {
  id: string;
  entityType: PublishableEntityType;
  entityTitle: string;
  slug: string | null;
  visibility: Visibility;
  publicationStatus: PublicationStatus;
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  archivedAt: string | null;
  isPubliclyDiscoverable: boolean;
  isDirectlyResolvable: boolean;
  allowedCommands: PublishingCommand[];
  publicRoute: string | null;
}

export interface PublishingListItemDTO {
  id: string;
  entityType: PublishableEntityType;
  entityTypeLabel: string;
  title: string;
  slug: string | null;
  visibility: Visibility;
  publicationStatus: PublicationStatus;
  publishedAt: string | null;
  scheduledPublishAt: string | null;
  archivedAt: string | null;
  updatedAt: string;
  hasReadinessErrors: boolean;
  hasReadinessWarnings: boolean;
  publicRoute: string | null;
}

export interface PublishingOverviewDTO {
  total: number;
  draft: number;
  review: number;
  scheduled: number;
  published: number;
  archived: number;
  unlisted: number;
  private: number;
  needsAttention: number;
}

export interface ScheduledPublicationDTO {
  id: string;
  entityType: PublishableEntityType;
  title: string;
  scheduledPublishAt: string;
  status: string;
}
