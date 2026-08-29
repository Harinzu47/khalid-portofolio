/**
 * Canonical Relationship Vocabulary — HZCODE Personal Developer OS
 * per HZCODE Relationship Model v1 (Section 5 & 6)
 */

export const RELATIONSHIP_TYPE_CODES = [
  'DERIVED_INTO',
  'BUILDS_ON',
  'EXPLAINS',
  'SUPPORTS',
  'REFERENCES',
  'APPLIES_TO',
  'LEARNS_THROUGH',
  'ORIGINATED_FROM',
] as const;

export type CanonicalRelationshipTypeCode = (typeof RELATIONSHIP_TYPE_CODES)[number];

export function isCanonicalRelationshipTypeCode(code: string): code is CanonicalRelationshipTypeCode {
  return RELATIONSHIP_TYPE_CODES.includes(code as CanonicalRelationshipTypeCode);
}

/**
 * Presentation inverse labels (Amendment 6: derived at read time, not stored).
 */
export const RELATIONSHIP_INVERSE_LABELS: Record<CanonicalRelationshipTypeCode, string> = {
  DERIVED_INTO: 'Derived From',
  BUILDS_ON: 'Built Upon By',
  EXPLAINS: 'Explained By',
  SUPPORTS: 'Supported By',
  REFERENCES: 'Referenced By',
  APPLIES_TO: 'Applied From',
  LEARNS_THROUGH: 'Used For Learning By',
  ORIGINATED_FROM: 'Produced',
};

/**
 * Prohibited semantic duplications where canonical relational tables/FKs already exist.
 * Enforces Amendment 11 (Structural-vs-Semantic Policy Guard).
 */
export interface ProhibitedSemanticEdge {
  relationshipTypeCode: CanonicalRelationshipTypeCode;
  sourceType: string;
  targetType: string;
  structuralAlternative: string;
}

export const PROHIBITED_SEMANTIC_EDGES: ProhibitedSemanticEdge[] = [
  {
    relationshipTypeCode: 'APPLIES_TO',
    sourceType: 'PROJECT',
    targetType: 'TECHNOLOGY',
    structuralAlternative: 'project_technologies junction table (Project USES Technology)',
  },
  {
    relationshipTypeCode: 'SUPPORTS',
    sourceType: 'PROJECT',
    targetType: 'SKILL',
    structuralAlternative: 'project_skills junction table (Project DEMONSTRATES Skill)',
  },
  {
    relationshipTypeCode: 'SUPPORTS',
    sourceType: 'EXPERIENCE',
    targetType: 'SKILL',
    structuralAlternative: 'experience_skills junction table (Experience DEMONSTRATES Skill)',
  },
  {
    relationshipTypeCode: 'APPLIES_TO',
    sourceType: 'EXPERIENCE',
    targetType: 'PROJECT',
    structuralAlternative: 'experience_projects junction table (Experience HAS_WORK Project)',
  },
  {
    relationshipTypeCode: 'LEARNS_THROUGH',
    sourceType: 'LEARNING_PATH',
    targetType: 'SKILL',
    structuralAlternative: 'learning_path_skills junction table (LearningPath DEVELOPS Skill)',
  },
  {
    relationshipTypeCode: 'SUPPORTS',
    sourceType: 'CERTIFICATE',
    targetType: 'SKILL',
    structuralAlternative: 'certificate_skills junction table (Certificate EVIDENCES Skill)',
  },
  {
    relationshipTypeCode: 'SUPPORTS',
    sourceType: 'CERTIFICATE',
    targetType: 'DOMAIN',
    structuralAlternative: 'certificate_domains junction table (Certificate EVIDENCES Domain)',
  },
  {
    relationshipTypeCode: 'APPLIES_TO',
    sourceType: 'CERTIFICATE',
    targetType: 'TECHNOLOGY',
    structuralAlternative: 'certificate_technologies junction table (Certificate EVIDENCES Technology)',
  },
];
