import React from 'react';
import { requireOwnerSession } from '@/lib/auth';
import { db } from '@/db/client';
import { knowledgeRelationships } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { EntityResolverService } from '@/services/entity-resolver.service';
import {
  type CanonicalEntityType,
  type CanonicalRelationshipTypeCode,
  RELATIONSHIP_INVERSE_LABELS,
  ENTITY_TYPE_LABELS,
} from '@/domain/relationships';
import type { RelationshipListItemDTO } from '@/types/dtos';
import { RelationshipsConsoleClient } from './RelationshipsConsoleClient';

interface RelationshipsPageProps {
  searchParams: Promise<{
    type?: string;
    sourceType?: string;
    targetType?: string;
    visibility?: string;
    status?: string;
  }>;
}

export default async function RelationshipsPage({ searchParams }: RelationshipsPageProps) {
  const session = await requireOwnerSession();
  const params = await searchParams;

  const whereConditions = [eq(knowledgeRelationships.ownerId, session.userId)];

  if (params.type) {
    // filter by relationship_type code or id handled in query
  }
  if (params.sourceType) {
    whereConditions.push(eq(knowledgeRelationships.sourceType, params.sourceType));
  }
  if (params.targetType) {
    whereConditions.push(eq(knowledgeRelationships.targetType, params.targetType));
  }
  if (params.visibility) {
    whereConditions.push(eq(knowledgeRelationships.visibility, params.visibility));
  }
  if (params.status) {
    whereConditions.push(eq(knowledgeRelationships.status, params.status));
  } else {
    // Default to active edges
    whereConditions.push(eq(knowledgeRelationships.status, 'active'));
  }

  const rawEdges = await db.query.knowledgeRelationships.findMany({
    where: and(...whereConditions),
    with: {
      relationshipType: true,
    },
    orderBy: [desc(knowledgeRelationships.createdAt)],
    limit: 100,
  });

  const relationships: RelationshipListItemDTO[] = [];

  for (const row of rawEdges) {
    if (params.type && row.relationshipType?.code !== params.type) {
      continue;
    }

    try {
      const source = await EntityResolverService.resolveOwnerEntity(
        session.userId,
        row.sourceType as CanonicalEntityType,
        row.sourceId
      );
      const target = await EntityResolverService.resolveOwnerEntity(
        session.userId,
        row.targetType as CanonicalEntityType,
        row.targetId
      );

      const code = row.relationshipType.code as CanonicalRelationshipTypeCode;

      relationships.push({
        id: row.id,
        relationshipType: {
          id: row.relationshipType.id,
          code,
          name: row.relationshipType.name,
          category: row.relationshipType.category,
          inverseLabel: row.relationshipType.inverseLabel || RELATIONSHIP_INVERSE_LABELS[code] || 'Related',
        },
        source: {
          id: source.id,
          entityType: source.entityType,
          label: source.label,
          slug: source.slug,
          visibility: source.visibility,
          publicationStatus: source.publicationStatus,
          isArchived: source.isArchived,
          typeCategory: source.typeCategory,
        },
        target: {
          id: target.id,
          entityType: target.entityType,
          label: target.label,
          slug: target.slug,
          visibility: target.visibility,
          publicationStatus: target.publicationStatus,
          isArchived: target.isArchived,
          typeCategory: target.typeCategory,
        },
        description: row.description,
        sortOrder: row.sortOrder,
        visibility: row.visibility as any,
        status: row.status as any,
        createdAt: row.createdAt.toISOString(),
      });
    } catch {
      // Endpoint resolution issue handled in diagnostics
    }
  }

  return (
    <div className="space-y-6">
      <RelationshipsConsoleClient initialEdges={relationships} />
    </div>
  );
}
