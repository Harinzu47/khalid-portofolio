import type { EntityRefDTO } from './common.dto';

// ==============================================================================
// 1. NOW ENTRY DTOs (Canonical Entity: NowEntry)
// ==============================================================================

export type NowEntryType =
  | 'building'
  | 'learning'
  | 'managing'
  | 'researching'
  | 'reading'
  | 'watching'
  | 'exploring'
  | 'using';

export type NowEntryStatus = 'active' | 'idle' | 'completed' | 'archived';

export interface NowEntryListItemDTO {
  id: string;
  entryType: NowEntryType;
  title: string;
  description?: string | null;
  status: NowEntryStatus;
  isCurrent: boolean;
  startedAt?: string | null;
  endedAt?: string | null;
  sortOrder: number;
  visibility: 'private' | 'unlisted' | 'public';
  publicationStatus: string;
  projectNames: string[];
  learningPathNames: string[];
  roadmapItemNames: string[];
  domainNames: string[];
  technologyNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NowEntryEditorDTO {
  id: string;
  entryType: NowEntryType;
  title: string;
  description?: string | null;
  status: NowEntryStatus;
  isCurrent: boolean;
  startedAt?: string | null;
  endedAt?: string | null;
  sortOrder: number;
  visibility: 'private' | 'unlisted' | 'public';
  publicationStatus: string;
  projectIds: string[];
  learningPathIds: string[];
  roadmapIds: string[];
  domainIds: string[];
  technologyIds: string[];
  projects: EntityRefDTO[];
  learningPaths: EntityRefDTO[];
  roadmaps: EntityRefDTO[];
  domains: EntityRefDTO[];
  technologies: EntityRefDTO[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface NowCurrentOverviewDTO {
  totalCurrent: number;
  groupedByType: Record<NowEntryType, NowEntryListItemDTO[]>;
}

// ==============================================================================
// 2. LEARNING PATH DTOs (Canonical Entity: LearningPath)
// ==============================================================================

export type LearningPathStatus = 'planned' | 'active' | 'paused' | 'completed' | 'archived';
export type ProgressMode = 'none' | 'manual';

export interface LearningPathListItemDTO {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  status: LearningPathStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  progressMode?: ProgressMode | null;
  progressValue?: number | null; // 0..100 explicit manual progress only (Amendment 7)
  currentFocus?: string | null;
  visibility: 'private' | 'unlisted' | 'public';
  publicationStatus: string;
  skills: EntityRefDTO[];
  domains: EntityRefDTO[];
  technologies: EntityRefDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningPathEditorDTO {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  status: LearningPathStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  progressMode?: ProgressMode | null;
  progressValue?: number | null;
  currentFocus?: string | null;
  content?: any;
  visibility: 'private' | 'unlisted' | 'public';
  publicationStatus: string;
  skillIds: string[];
  domainIds: string[];
  technologyIds: string[];
  skills: EntityRefDTO[];
  domains: EntityRefDTO[];
  technologies: EntityRefDTO[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

// ==============================================================================
// 3. ROADMAP DTOs (Canonical Entity: Roadmap)
// ==============================================================================

export type RoadmapStatus = 'backlog' | 'planned' | 'in_progress' | 'completed';

export interface RoadmapListItemDTO {
  id: string;
  title: string;
  slug?: string | null;
  summary?: string | null;
  category?: string | null;
  roadmapType?: string | null;
  status: RoadmapStatus;
  priority: number;
  startDate?: string | null;
  targetDate?: string | null;
  sortOrder: number;
  visibility: 'private' | 'unlisted' | 'public';
  publicationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapEditorDTO {
  id: string;
  title: string;
  slug?: string | null;
  summary?: string | null;
  description?: string | null;
  category?: string | null;
  roadmapType?: string | null;
  status: RoadmapStatus;
  priority: number;
  startDate?: string | null;
  targetDate?: string | null;
  sortOrder: number;
  content?: any;
  visibility: 'private' | 'unlisted' | 'public';
  publicationStatus: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface RoadmapReorderItemDTO {
  id: string;
  sortOrder: number;
}

// ==============================================================================
// 4. CERTIFICATE DTOs (Canonical Entity: Certificate)
// ==============================================================================

export type CertificateVerificationStatus = 'unverified' | 'verified' | 'expired' | 'revoked';

export interface CertificateListItemDTO {
  id: string;
  name: string;
  title?: string | null;
  issuer: string;
  issuedAt: string;
  expiresAt?: string | null;
  verificationStatus?: CertificateVerificationStatus | string | null;
  visibility: 'private' | 'unlisted' | 'public';
  publicationStatus: string;
  skills: EntityRefDTO[];
  domains: EntityRefDTO[];
  technologies: EntityRefDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CertificateEditorDTO {
  id: string;
  name: string;
  title?: string | null;
  issuer: string;
  credentialId?: string | null;
  credentialUrl?: string | null;
  issuedAt: string;
  expiresAt?: string | null;
  certificateMediaId?: string | null;
  certificateMediaUrl?: string | null;
  description?: string | null;
  verificationStatus?: CertificateVerificationStatus | string | null;
  visibility: 'private' | 'unlisted' | 'public';
  publicationStatus: string;
  skillIds: string[];
  domainIds: string[];
  technologyIds: string[];
  skills: EntityRefDTO[];
  domains: EntityRefDTO[];
  technologies: EntityRefDTO[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

// ==============================================================================
// 5. AGGREGATE LEARNING OVERVIEW DTO (Amendment 2)
// ==============================================================================

export interface LearningOverviewDTO {
  activeLearningPaths: LearningPathListItemDTO[];
  currentLearningNowEntries: NowEntryListItemDTO[];
  upcomingRoadmapItems: RoadmapListItemDTO[];
  totalLearningPaths: number;
  totalCertificates: number;
  totalRoadmapItems: number;
  totalCurrentNow: number;
}
