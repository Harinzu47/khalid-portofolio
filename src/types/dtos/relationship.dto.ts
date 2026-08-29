import type { VisibilityStatus } from './common.dto';
import type {
  CanonicalEntityType,
  CanonicalRelationshipTypeCode,
} from '@/domain/relationships';

export type { CanonicalEntityType, CanonicalRelationshipTypeCode };

/**
 * 1. RelationshipTypeDTO — Controlled lookup vocabulary representation
 */
export interface RelationshipTypeDTO {
  id: string;
  code: CanonicalRelationshipTypeCode;
  name: string;
  category: string;
  inverseLabel: string;
  description: string | null;
  directionality: string;
  isPublicEligible: boolean;
  isActive: boolean;
}

/**
 * 2. RelationshipEndpointDTO — Sanitized projection of source/target entity.
 * Strict DTO boundary: zero ownerId or raw DB internals.
 */
export interface RelationshipEndpointDTO {
  id: string;
  entityType: CanonicalEntityType;
  label: string;
  slug: string | null;
  visibility: VisibilityStatus;
  publicationStatus: string | null;
  isArchived: boolean;
  typeCategory?: string | null;
}

/**
 * 3. RelationshipListItemDTO — Listing projection for knowledge relationships.
 */
export interface RelationshipListItemDTO {
  id: string;
  relationshipType: {
    id: string;
    code: CanonicalRelationshipTypeCode;
    name: string;
    category: string;
    inverseLabel: string;
  };
  source: RelationshipEndpointDTO;
  target: RelationshipEndpointDTO;
  description: string | null;
  sortOrder: number;
  visibility: VisibilityStatus;
  status: 'active' | 'archived';
  createdAt: string;
}

/**
 * 4. RelationshipEditorDTO — Detailed view for single edge inspection & metadata update.
 */
export interface RelationshipEditorDTO {
  id: string;
  relationshipTypeId: string;
  relationshipTypeCode: CanonicalRelationshipTypeCode;
  relationshipTypeName: string;
  inverseLabel: string;
  sourceType: CanonicalEntityType;
  sourceId: string;
  source: RelationshipEndpointDTO;
  targetType: CanonicalEntityType;
  targetId: string;
  target: RelationshipEndpointDTO;
  description: string | null;
  sortOrder: number;
  visibility: VisibilityStatus;
  status: 'active' | 'archived';
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 5. RelationshipCandidateDTO — Projection for target entity search dropdowns.
 */
export interface RelationshipCandidateDTO {
  id: string;
  entityType: CanonicalEntityType;
  label: string;
  slug: string | null;
  typeCategory?: string | null;
  visibility: VisibilityStatus;
  publicationStatus?: string | null;
}

/**
 * 6. Health diagnostics issues classification (Amendment 24).
 */
export type RelationshipHealthIssueCode =
  | 'MISSING_ENDPOINT'
  | 'ARCHIVED_ENDPOINT'
  | 'INCOMPATIBLE_EDGE'
  | 'DUPLICATE_ACTIVE_EDGE'
  | 'UNSUPPORTED_ENTITY_TYPE'
  | 'PUBLIC_PRIVACY_MISMATCH';

export interface RelationshipHealthIssueDTO {
  relationshipId: string;
  relationshipTypeCode: string;
  severity: 'warning' | 'error';
  issueCode: RelationshipHealthIssueCode;
  message: string;
  source: {
    entityType: string;
    id: string;
    label?: string;
  };
  target: {
    entityType: string;
    id: string;
    label?: string;
  };
}

export interface RelationshipHealthSummaryDTO {
  totalActive: number;
  totalArchived: number;
  totalIssues: number;
  issues: RelationshipHealthIssueDTO[];
}

/**
 * 7. Bounded graph visualizer contracts.
 */
export interface RelationshipGraphNodeDTO {
  id: string; // Globally unique key: `${entityType}:${uuid}`
  entityId: string;
  entityType: CanonicalEntityType;
  label: string;
  slug: string | null;
  visibility: VisibilityStatus;
}

export interface RelationshipGraphEdgeDTO {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipTypeCode: CanonicalRelationshipTypeCode;
  label: string;
  visibility: VisibilityStatus;
}

/**
 * 8. Entity-centric relationship aggregate container.
 */
export interface EntityRelationshipsDTO {
  outgoing: RelationshipListItemDTO[];
  incoming: RelationshipListItemDTO[];
}
