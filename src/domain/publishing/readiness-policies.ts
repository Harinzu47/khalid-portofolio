import type { PublishableEntityType } from './entity-registry';

/**
 * Stable Publication Issue Codes (Amendment 10).
 * Prevents UI from parsing human-readable messages.
 */
export const PUBLICATION_ISSUE_CODES = [
  'MISSING_TITLE',
  'MISSING_SLUG',
  'DUPLICATE_ROUTE_SLUG',
  'MISSING_CONTENT',
  'MISSING_REQUIRED_FIELD',
  'MISSING_START_DATE',
  'MISSING_PARENT_PROJECT',
  'PARENT_PROJECT_UNPUBLISHED',
  'UNVERIFIED_STATUS',
  'MISSING_EXCERPT',
  'MISSING_MEDIA',
  'MISSING_TAXONOMY',
  'PROPOSED_ADR_STATUS',
  'EXPIRED_CERTIFICATE',
] as const;

export type PublicationIssueCode = (typeof PUBLICATION_ISSUE_CODES)[number];

export type PublicationIssueSeverity = 'error' | 'warning' | 'info';

export interface PublicationIssue {
  code: PublicationIssueCode;
  severity: PublicationIssueSeverity;
  message: string;
  field?: string;
}

export interface ReadinessEvaluationContext {
  parentEntity?: {
    id: string;
    visibility: string;
    publicationStatus: string;
    archivedAt?: Date | null;
  } | null;
  hasDuplicateRouteSlug?: boolean;
}

export interface EntityReadinessPolicy {
  entityType: PublishableEntityType;
  evaluateBasicReadiness: (entity: any) => PublicationIssue[];
  evaluateFullReadiness: (
    entity: any,
    context?: ReadinessEvaluationContext
  ) => PublicationIssue[];
}

/**
 * Canonical Entity-Specific Readiness Policies (Amendments 9, 10, 11, 12, 33).
 */
export const ENTITY_READINESS_POLICIES: Record<
  PublishableEntityType,
  EntityReadinessPolicy
> = {
  ARTICLE: {
    entityType: 'ARTICLE',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Article requires a title.',
          field: 'title',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity, ctx) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Article requires a title.',
          field: 'title',
        });
      }
      if (!entity.slug?.trim()) {
        issues.push({
          code: 'MISSING_SLUG',
          severity: 'error',
          message: 'Article requires a unique slug.',
          field: 'slug',
        });
      }
      if (ctx?.hasDuplicateRouteSlug) {
        issues.push({
          code: 'DUPLICATE_ROUTE_SLUG',
          severity: 'error',
          message: 'Article slug collides with an existing published article route.',
          field: 'slug',
        });
      }
      if (!entity.content?.trim()) {
        issues.push({
          code: 'MISSING_CONTENT',
          severity: 'error',
          message: 'Article body content cannot be empty.',
          field: 'content',
        });
      }
      if (!entity.excerpt?.trim() && !entity.summary?.trim()) {
        issues.push({
          code: 'MISSING_EXCERPT',
          severity: 'warning',
          message: 'Article has no excerpt or summary; social cards may display raw text.',
          field: 'excerpt',
        });
      }
      if (!entity.ogImageId) {
        issues.push({
          code: 'MISSING_MEDIA',
          severity: 'info',
          message: 'No custom OpenGraph image is configured for this article.',
          field: 'ogImageId',
        });
      }
      return issues;
    },
  },

  TECH_NOTE: {
    entityType: 'TECH_NOTE',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Tech Note requires a title.',
          field: 'title',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity, ctx) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Tech Note requires a title.',
          field: 'title',
        });
      }
      if (!entity.slug?.trim()) {
        issues.push({
          code: 'MISSING_SLUG',
          severity: 'error',
          message: 'Tech Note requires a unique slug.',
          field: 'slug',
        });
      }
      if (ctx?.hasDuplicateRouteSlug) {
        issues.push({
          code: 'DUPLICATE_ROUTE_SLUG',
          severity: 'error',
          message: 'Tech Note slug collides with an existing published note route.',
          field: 'slug',
        });
      }
      if (!entity.content?.trim()) {
        issues.push({
          code: 'MISSING_CONTENT',
          severity: 'error',
          message: 'Tech Note content cannot be empty.',
          field: 'content',
        });
      }
      if (!entity.verificationStatus || entity.verificationStatus === 'unverified') {
        issues.push({
          code: 'UNVERIFIED_STATUS',
          severity: 'warning',
          message: 'Tech Note is unverified. Recommended to verify before publishing.',
          field: 'verificationStatus',
        });
      }
      return issues;
    },
  },

  ADR: {
    entityType: 'ADR',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'ADR requires a title.',
          field: 'title',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity, ctx) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'ADR requires a title.',
          field: 'title',
        });
      }
      if (!entity.slug?.trim()) {
        issues.push({
          code: 'MISSING_SLUG',
          severity: 'error',
          message: 'ADR requires a unique slug.',
          field: 'slug',
        });
      }
      if (ctx?.hasDuplicateRouteSlug) {
        issues.push({
          code: 'DUPLICATE_ROUTE_SLUG',
          severity: 'error',
          message: 'ADR slug collides with an existing published ADR route.',
          field: 'slug',
        });
      }
      if (!entity.decision?.trim()) {
        issues.push({
          code: 'MISSING_CONTENT',
          severity: 'error',
          message: 'ADR requires an explicit decision section.',
          field: 'decision',
        });
      }
      if (entity.status === 'proposed') {
        issues.push({
          code: 'PROPOSED_ADR_STATUS',
          severity: 'warning',
          message: 'ADR is currently in PROPOSED domain status.',
          field: 'status',
        });
      }
      return issues;
    },
  },

  JOURNAL_ENTRY: {
    entityType: 'JOURNAL_ENTRY',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.content?.trim()) {
        issues.push({
          code: 'MISSING_CONTENT',
          severity: 'error',
          message: 'Journal entry content cannot be empty.',
          field: 'content',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity, ctx) => {
      const issues: PublicationIssue[] = [];
      if (!entity.content?.trim()) {
        issues.push({
          code: 'MISSING_CONTENT',
          severity: 'error',
          message: 'Journal entry content cannot be empty.',
          field: 'content',
        });
      }
      if (!entity.entryDate) {
        issues.push({
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'error',
          message: 'Journal entry requires an entry date.',
          field: 'entryDate',
        });
      }
      if (!entity.slug?.trim()) {
        issues.push({
          code: 'MISSING_SLUG',
          severity: 'error',
          message: 'Journal entry requires a unique slug for public routing.',
          field: 'slug',
        });
      }
      if (ctx?.hasDuplicateRouteSlug) {
        issues.push({
          code: 'DUPLICATE_ROUTE_SLUG',
          severity: 'error',
          message: 'Journal slug collides with an existing published entry.',
          field: 'slug',
        });
      }
      return issues;
    },
  },

  PROJECT: {
    entityType: 'PROJECT',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Project requires a title.',
          field: 'title',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity, ctx) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Project requires a title.',
          field: 'title',
        });
      }
      if (!entity.slug?.trim()) {
        issues.push({
          code: 'MISSING_SLUG',
          severity: 'error',
          message: 'Project requires a unique slug.',
          field: 'slug',
        });
      }
      if (ctx?.hasDuplicateRouteSlug) {
        issues.push({
          code: 'DUPLICATE_ROUTE_SLUG',
          severity: 'error',
          message: 'Project slug collides with an existing published project.',
          field: 'slug',
        });
      }
      if (!entity.description?.trim() && !entity.shortDescription?.trim()) {
        issues.push({
          code: 'MISSING_CONTENT',
          severity: 'error',
          message: 'Project requires a description or short summary.',
          field: 'description',
        });
      }
      return issues;
    },
  },

  PROJECT_CASE_STUDY: {
    entityType: 'PROJECT_CASE_STUDY',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.projectId) {
        issues.push({
          code: 'MISSING_PARENT_PROJECT',
          severity: 'error',
          message: 'Case study must be attached to a parent project.',
          field: 'projectId',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity, ctx) => {
      const issues: PublicationIssue[] = [];
      if (!entity.projectId) {
        issues.push({
          code: 'MISSING_PARENT_PROJECT',
          severity: 'error',
          message: 'Case study must be attached to a parent project.',
          field: 'projectId',
        });
      }
      if (!entity.executiveSummary?.trim() && !entity.problemStatement?.trim()) {
        issues.push({
          code: 'MISSING_CONTENT',
          severity: 'error',
          message: 'Case study requires an executive summary or problem statement.',
          field: 'executiveSummary',
        });
      }
      // Amendment 33: Parent project dependency
      if (ctx?.parentEntity) {
        const isParentPublic =
          ctx.parentEntity.visibility === 'public' &&
          ctx.parentEntity.publicationStatus === 'published' &&
          !ctx.parentEntity.archivedAt;
        if (!isParentPublic) {
          issues.push({
            code: 'PARENT_PROJECT_UNPUBLISHED',
            severity: 'warning',
            message:
              'Parent Project is not publicly published. This case study will remain non-discoverable publicly until parent publishes.',
            field: 'projectId',
          });
        }
      }
      return issues;
    },
  },

  EXPERIENCE: {
    entityType: 'EXPERIENCE',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.position?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Experience requires a role or position title.',
          field: 'position',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.position?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Experience requires a role or position title.',
          field: 'position',
        });
      }
      if (!entity.startDate) {
        issues.push({
          code: 'MISSING_START_DATE',
          severity: 'error',
          message: 'Experience requires a start date.',
          field: 'startDate',
        });
      }
      return issues;
    },
  },

  LEARNING_PATH: {
    entityType: 'LEARNING_PATH',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Learning path requires a title.',
          field: 'title',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity, ctx) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Learning path requires a title.',
          field: 'title',
        });
      }
      if (!entity.slug?.trim()) {
        issues.push({
          code: 'MISSING_SLUG',
          severity: 'error',
          message: 'Learning path requires a unique slug.',
          field: 'slug',
        });
      }
      if (ctx?.hasDuplicateRouteSlug) {
        issues.push({
          code: 'DUPLICATE_ROUTE_SLUG',
          severity: 'error',
          message: 'Learning path slug collides with an existing learning path route.',
          field: 'slug',
        });
      }
      return issues;
    },
  },

  ROADMAP: {
    entityType: 'ROADMAP',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Roadmap item requires a title.',
          field: 'title',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Roadmap item requires a title.',
          field: 'title',
        });
      }
      if (!entity.category?.trim()) {
        issues.push({
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'warning',
          message: 'Roadmap item has no track/category assigned.',
          field: 'category',
        });
      }
      return issues;
    },
  },

  CERTIFICATE: {
    entityType: 'CERTIFICATE',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.name?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Certificate requires a credential name.',
          field: 'name',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.name?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Certificate requires a credential name.',
          field: 'name',
        });
      }
      if (!entity.issuer?.trim()) {
        issues.push({
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'error',
          message: 'Certificate requires an issuing organization or authority.',
          field: 'issuer',
        });
      }
      if (!entity.issuedAt) {
        issues.push({
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'error',
          message: 'Certificate requires an issued date.',
          field: 'issuedAt',
        });
      }
      if (entity.expiresAt && new Date(entity.expiresAt) < new Date()) {
        issues.push({
          code: 'EXPIRED_CERTIFICATE',
          severity: 'info',
          message: 'This certificate has past its expiration date.',
          field: 'expiresAt',
        });
      }
      return issues;
    },
  },

  NOW_ENTRY: {
    entityType: 'NOW_ENTRY',
    evaluateBasicReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Now entry requires a title.',
          field: 'title',
        });
      }
      return issues;
    },
    evaluateFullReadiness: (entity) => {
      const issues: PublicationIssue[] = [];
      if (!entity.title?.trim()) {
        issues.push({
          code: 'MISSING_TITLE',
          severity: 'error',
          message: 'Now entry requires a title.',
          field: 'title',
        });
      }
      if (!entity.entryType) {
        issues.push({
          code: 'MISSING_REQUIRED_FIELD',
          severity: 'error',
          message: 'Now entry requires an activity type.',
          field: 'entryType',
        });
      }
      return issues;
    },
  },
};
