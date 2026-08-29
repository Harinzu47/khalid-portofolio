/**
 * Phase 10: Canonical Public Read Model DTO Contracts
 * In accordance with HZCODE Public System Audit & Review Amendments 4, 5, 6, 7, 8, 9, 22.
 * Strictly zero-leak: NO internal UUIDs, NO owner_id, NO search_vector, NO private provenance.
 */

export interface PublicEntityRefDTO {
  name: string;
  slug: string;
  color?: string | null;
  icon?: string | null;
}

export interface PublicMediaItemDTO {
  url: string;
  altText: string;
  caption?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
}

export interface RelatedKnowledgeItemDTO {
  entityType: 'ARTICLE' | 'TECH_NOTE' | 'ADR' | 'JOURNAL_ENTRY';
  title: string;
  slug: string;
  summary: string | null;
  href: string;
  publishedAt: string | null;
}

/**
 * Split Work Index Item (Amendment 4)
 */
export interface WorkIndexItemDTO {
  slug: string;
  title: string;
  shortDescription: string | null;
  projectType: string | null;
  status: string;
  featured: boolean;
  domains: PublicEntityRefDTO[];
  technologies: PublicEntityRefDTO[];
  skills: PublicEntityRefDTO[];
  hasCaseStudy: boolean;
  publishedAt: string | null;
  thumbnailUrl: string | null;
}

export interface ProjectCaseStudyDetailDTO {
  title: string | null;
  subtitle: string | null;
  executiveSummary: string | null;
  context: string | null;
  problem: string | null;
  role: string | null;
  constraints: string | null;
  approach: string | null;
  architecture: string | null;
  implementation: string | null;
  quantitativeOutcomes: string | null;
  learnings: string | null;
}

/**
 * Deep Project Detail (Amendment 4)
 */
export interface ProjectDetailDTO {
  slug: string;
  title: string;
  tagline?: string | null;
  shortDescription: string | null;
  description: string | null;
  projectType: string | null;
  role: string | null;
  roleSummary?: string | null;
  problemStatement: string | null;
  solution: string | null;
  architecture: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  repositoryUrl: string | null;
  liveUrl: string | null;
  documentationUrl?: string | null;
  featured: boolean;
  domains: PublicEntityRefDTO[];
  technologies: PublicEntityRefDTO[];
  skills: PublicEntityRefDTO[];
  tags: PublicEntityRefDTO[];
  caseStudy: ProjectCaseStudyDetailDTO | null;
  media: PublicMediaItemDTO[];
  relatedKnowledge: RelatedKnowledgeItemDTO[];
  isUnlisted: boolean;
  publishedAt: string | null;
}

export interface ExperiencePublicDTO {
  role: string;
  organizationName: string;
  organizationUrl: string | null;
  organizationLogoUrl: string | null;
  employmentType: string | null;
  location: string | null;
  locationType: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  achievements: string[];
  domains: PublicEntityRefDTO[];
  skills: PublicEntityRefDTO[];
  technologies: PublicEntityRefDTO[];
  linkedProjects: { title: string; slug: string }[];
}

export interface ExperienceTimelineDTO {
  experiences: ExperiencePublicDTO[];
  totalPositions: number;
}

export interface ExpertiseEvidenceCount {
  projects: number;
  experiences: number;
  knowledge: number;
  certificates: number;
  total: number;
}

export interface ExpertiseItemDTO {
  name: string;
  slug: string;
  type: 'SKILL' | 'TECHNOLOGY' | 'DOMAIN';
  category: string | null;
  icon?: string | null;
  description: string | null;
  evidenceCount: ExpertiseEvidenceCount;
  representativeProjects: { title: string; slug: string }[];
  representativeKnowledge: { title: string; slug: string; entityType: string; href: string }[];
  linkedCertificates: {
    name: string;
    issuer: string;
    issueYear?: number | null;
    issueDate?: string | null;
    verificationUrl: string | null;
  }[];
}

export interface ExpertiseReadModelDTO {
  domains: ExpertiseItemDTO[];
  technologies: ExpertiseItemDTO[];
  skills: ExpertiseItemDTO[];
}

export interface KnowledgeHubItemDTO {
  entityType: 'ARTICLE' | 'TECH_NOTE' | 'ADR' | 'JOURNAL_ENTRY';
  title: string;
  slug: string;
  summary: string | null;
  publishedAt: string | null;
  readingTimeMinutes?: number | null;
  noteNumber?: number | null;
  adrNumber?: number | null;
  adrStatus?: string | null;
  journalDate?: string | null;
  tags: PublicEntityRefDTO[];
  domains: PublicEntityRefDTO[];
  technologies: PublicEntityRefDTO[];
  href: string;
}

export interface KnowledgeDetailDTO {
  entityType: 'ARTICLE' | 'TECH_NOTE' | 'ADR' | 'JOURNAL_ENTRY';
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt?: string | null;
  content: string;
  publishedAt: string | null;
  readingTimeMinutes?: number | null;
  noteNumber?: number | null;
  verificationStatus?: string | null;
  adrNumber?: number | null;
  adrStatus?: string | null;
  adrContext?: string | null;
  adrDecision?: string | null;
  adrConsequences?: string | null;
  journalDate?: string | null;
  tags: PublicEntityRefDTO[];
  domains: PublicEntityRefDTO[];
  technologies: PublicEntityRefDTO[];
  skills: PublicEntityRefDTO[];
  relatedKnowledge: RelatedKnowledgeItemDTO[];
  isUnlisted: boolean;
}

export type NowCategory =
  | 'BUILDING'
  | 'LEARNING'
  | 'MANAGING'
  | 'RESEARCHING'
  | 'READING'
  | 'WATCHING'
  | 'EXPLORING'
  | 'USING';

export interface NowEntryPublicDTO {
  title: string;
  description: string | null;
  category: NowCategory;
  status: 'ACTIVE' | 'COMPLETED';
  progressPercent: number | null;
  startedAt: string | null;
  completedAt: string | null;
  contextUrl: string | null;
  contextTitle: string | null;
  linkedProject: { title: string; slug: string } | null;
  linkedKnowledge: { title: string; slug: string; href: string } | null;
}

export interface NowPublicDTO {
  lastUpdated: string | null;
  activeEntries: NowEntryPublicDTO[];
  recentCompletedEntries: NowEntryPublicDTO[];
  categories: Record<string, NowEntryPublicDTO[]>;
}

export interface PublicProfileDTO {
  fullName: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  availabilityStatus: string | null;
}

export interface AboutPublicDTO {
  profile: PublicProfileDTO;
  principles: { title: string; description: string }[];
  workingStyle: { title: string; description: string }[];
  currentFocusSummary: string | null;
}

export interface HomePublicDTO {
  hero: PublicProfileDTO;
  featuredProjects: WorkIndexItemDTO[];
  currentExperience: ExperiencePublicDTO | null;
  currentNow: NowEntryPublicDTO[];
  selectedKnowledge: KnowledgeHubItemDTO[];
  topCapabilities: ExpertiseItemDTO[];
}
