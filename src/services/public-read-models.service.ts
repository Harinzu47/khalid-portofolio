import { db } from '@/db/client';
import {
  projects,
  projectCaseStudies,
  articles,
  notes,
  adrs,
  journalEntries,
  careerExperiences,
  skills,
  domains,
  technologies,
  certificates,
  certificateSkills,
  nowEntries,
  profiles,
  knowledgeRelationships,
} from '@/db/schema';
import { eq, and, sql, isNull, lte, desc, asc, inArray } from 'drizzle-orm';
import { MediaDeliveryService } from './media-delivery.service';
import { sanitizePublicUrl } from '@/lib/security';
import type {
  WorkIndexItemDTO,
  ProjectDetailDTO,
  ProjectCaseStudyDetailDTO,
  ExperiencePublicDTO,
  ExperienceTimelineDTO,
  ExpertiseItemDTO,
  ExpertiseReadModelDTO,
  KnowledgeHubItemDTO,
  KnowledgeDetailDTO,
  NowEntryPublicDTO,
  NowPublicDTO,
  NowCategory,
  AboutPublicDTO,
  PublicProfileDTO,
  HomePublicDTO,
  PublicEntityRefDTO,
  PublicMediaItemDTO,
  RelatedKnowledgeItemDTO,
} from '@/types/dtos/public-read-models.dto';

const formatJsonField = (val: unknown): string | null => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join('\n');
  return JSON.stringify(val);
};

export class PublicReadModelsService {
  // =========================================================================
  // 1. WORK READ MODELS (/work and /work/[slug])
  // =========================================================================

  /**
   * Retrieves public work archive listing (Amendments 4, 14, 16, 25).
   * Filtering is public-only, non-archived, publishedAt <= now().
   */
  static async getWorkIndex(params?: {
    pillar?: string;
    search?: string;
  }): Promise<WorkIndexItemDTO[]> {
    const rows = await db.query.projects.findMany({
      where: and(
        eq(projects.visibility, 'public'),
        eq(projects.publicationStatus, 'published'),
        lte(projects.publishedAt, sql`now()`),
        isNull(projects.archivedAt)
      ),
      orderBy: [desc(projects.featured), asc(projects.sortOrder), desc(projects.publishedAt)],
      with: {
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
        skills: { with: { skill: true } },
        caseStudy: true,
        media: {
          with: { media: true },
          orderBy: (t: any, { asc }: any) => [asc(t.sortOrder)],
        },
      },
    });

    const items: WorkIndexItemDTO[] = [];

    for (const p of rows) {
      // Check pillar / domain filtering if provided
      const domainRefs: PublicEntityRefDTO[] = p.domains.map((pd) => ({
        name: pd.domain.name,
        slug: pd.domain.slug,
        color: null,
        icon: null,
      }));

      if (params?.pillar) {
        const matchesPillar = domainRefs.some(
          (d) =>
            d.slug.toLowerCase() === params.pillar?.toLowerCase() ||
            d.name.toLowerCase() === params.pillar?.toLowerCase()
        );
        if (!matchesPillar) continue;
      }

      if (params?.search) {
        const q = params.search.toLowerCase();
        const matchesSearch =
          p.title.toLowerCase().includes(q) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(q));
        if (!matchesSearch) continue;
      }

      // Check if case study exists and is eligible
      const hasCaseStudy =
        Boolean(p.caseStudy) &&
        p.caseStudy?.visibility === 'public' &&
        p.caseStudy?.publicationStatus === 'published' &&
        !p.caseStudy?.archivedAt;

      // Extract primary thumbnail URL if available
      let thumbnailUrl: string | null = null;
      if (p.media && p.media.length > 0) {
        const firstMedia = p.media[0].media;
        if (firstMedia && firstMedia.path) {
          thumbnailUrl = await MediaDeliveryService.resolvePublicDeliveryUrl(firstMedia.path);
        }
      }

      items.push({
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        projectType: p.projectType,
        status: p.status,
        featured: p.featured,
        domains: domainRefs,
        technologies: p.technologies.map((pt) => ({
          name: pt.technology.name,
          slug: pt.technology.slug,
          color: null,
          icon: pt.technology.iconName,
        })),
        skills: p.skills.map((ps) => ({
          name: ps.skill.name,
          slug: ps.skill.slug,
        })),
        hasCaseStudy,
        publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
        thumbnailUrl,
      });
    }

    return items;
  }

  /**
   * Retrieves single deep project detail by slug (Amendments 4, 6, 16, 25, 34).
   * Supports direct-route access for UNLISTED + PUBLISHED projects.
   */
  static async getProjectDetailBySlug(slug: string): Promise<ProjectDetailDTO | null> {
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.slug, slug),
        inArray(projects.visibility, ['public', 'unlisted']),
        eq(projects.publicationStatus, 'published'),
        lte(projects.publishedAt, sql`now()`),
        isNull(projects.archivedAt)
      ),
      with: {
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
        skills: { with: { skill: true } },
        tags: { with: { tag: true } },
        caseStudy: true,
        media: {
          with: { media: true },
          orderBy: (t: any, { asc }: any) => [asc(t.sortOrder)],
        },
      },
    });

    if (!project) return null;

    // Resolve case study if eligible (must also be published and not archived)
    let caseStudyDetail: ProjectCaseStudyDetailDTO | null = null;
    if (
      project.caseStudy &&
      project.caseStudy.publicationStatus === 'published' &&
      !project.caseStudy.archivedAt &&
      (project.caseStudy.visibility === 'public' || project.caseStudy.visibility === project.visibility)
    ) {
      const cs = project.caseStudy;
      caseStudyDetail = {
        title: cs.title,
        subtitle: cs.subtitle,
        executiveSummary: cs.executiveSummary,
        context: null,
        problem: cs.problemStatement,
        role: project.role,
        constraints: formatJsonField(cs.constraints),
        approach: formatJsonField(cs.objectives),
        architecture: formatJsonField(cs.architecture),
        implementation: formatJsonField(cs.implementation),
        quantitativeOutcomes: formatJsonField(cs.results),
        learnings: formatJsonField(cs.reflection),
      };
    }

    // Resolve media delivery URLs
    const resolvedMedia: PublicMediaItemDTO[] = [];
    if (project.media && project.media.length > 0) {
      for (const item of project.media) {
        if (item.media && item.media.path) {
          const url = await MediaDeliveryService.resolvePublicDeliveryUrl(item.media.path);
          if (url) {
            resolvedMedia.push({
              url,
              caption: null,
              altText: project.title,
              isPrimary: item.isCover,
              sortOrder: item.sortOrder,
            });
          }
        }
      }
    }

    // Resolve bounded related public knowledge (depth-1, max 4 items - Amendment 34)
    const relatedKnowledge = await this.getRelatedPublicKnowledge('PROJECT', project.id, 4);

    return {
      slug: project.slug,
      title: project.title,
      tagline: null,
      shortDescription: project.shortDescription,
      description: project.description,
      problemStatement: project.problemStatement,
      solution: project.solution,
      architecture: project.architecture,
      projectType: project.projectType,
      role: project.role,
      roleSummary: project.roleSummary,
      status: project.status,
      startDate: project.startDate || null,
      endDate: project.endDate || null,
      repositoryUrl: sanitizePublicUrl(project.repositoryUrl),
      liveUrl: sanitizePublicUrl(project.liveUrl),
      documentationUrl: null,
      featured: project.featured,
      domains: project.domains.map((d) => ({
        name: d.domain.name,
        slug: d.domain.slug,
        color: null,
        icon: null,
      })),
      technologies: project.technologies.map((t) => ({
        name: t.technology.name,
        slug: t.technology.slug,
        color: null,
        icon: t.technology.iconName,
      })),
      skills: project.skills.map((s) => ({
        name: s.skill.name,
        slug: s.skill.slug,
      })),
      tags: project.tags.map((t) => ({
        name: t.tag.name,
        slug: t.tag.slug,
      })),
      caseStudy: caseStudyDetail,
      media: resolvedMedia,
      relatedKnowledge,
      isUnlisted: project.visibility === 'unlisted',
      publishedAt: project.publishedAt ? project.publishedAt.toISOString() : null,
    };
  }

  // =========================================================================
  // 2. EXPERIENCE READ MODEL (/experience)
  // =========================================================================

  /**
   * Retrieves chronological career experience timeline (Amendments 10, 12, 33).
   * Strict deterministic ordering: startDate DESC, endDate DESC NULLS FIRST, role ASC.
   */
  static async getExperienceTimeline(): Promise<ExperienceTimelineDTO> {
    const rows = await db.query.careerExperiences.findMany({
      where: and(
        eq(careerExperiences.visibility, 'public'),
        eq(careerExperiences.publicationStatus, 'published'),
        isNull(careerExperiences.archivedAt)
      ),
      orderBy: [desc(careerExperiences.startDate), desc(careerExperiences.isCurrent)],
      with: {
        organization: true,
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
        skills: { with: { skill: true } },
        projects: { with: { project: true } },
      },
    });

    const experiences: ExperiencePublicDTO[] = [];

    for (const exp of rows) {
      // Filter linked projects to public-only
      const linkedProjects: { title: string; slug: string }[] = exp.projects
        .filter(
          (p) =>
            p.project &&
            p.project.visibility === 'public' &&
            p.project.publicationStatus === 'published' &&
            !p.project.archivedAt
        )
        .map((p) => ({
          title: p.project.title,
          slug: p.project.slug,
        }));

      experiences.push({
        role: exp.position,
        organizationName: exp.organization?.name || 'Independent / Client',
        organizationUrl: sanitizePublicUrl(exp.organization?.websiteUrl),
        organizationLogoUrl: exp.organization?.logoPath
          ? await MediaDeliveryService.resolvePublicDeliveryUrl(exp.organization.logoPath)
          : null,
        employmentType: exp.employmentType,
        location: exp.location,
        locationType: null,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        description: exp.description,
        achievements: (exp.responsibilities as string[]) || [],
        domains: exp.domains.map((d) => ({
          name: d.domain.name,
          slug: d.domain.slug,
          color: null,
          icon: null,
        })),
        technologies: exp.technologies.map((t) => ({
          name: t.technology.name,
          slug: t.technology.slug,
          color: null,
          icon: t.technology.iconName,
        })),
        skills: exp.skills.map((s) => ({
          name: s.skill.name,
          slug: s.skill.slug,
        })),
        linkedProjects,
      });
    }

    return {
      experiences,
      totalPositions: experiences.length,
    };
  }

  // =========================================================================
  // 3. EXPERTISE READ MODEL (/expertise)
  // =========================================================================

  /**
   * Retrieves evidence-backed capability aggregation (Amendments 7, 8, 9).
   */
  static async getExpertiseReadModel(): Promise<ExpertiseReadModelDTO> {
    // 1. Domains
    const domainRows = await db.query.domains.findMany({
      where: and(eq(domains.visibility, 'public'), isNull(domains.archivedAt)),
      with: {
        projects: { with: { project: true } },
        experiences: { with: { experience: true } },
        articles: { with: { article: true } },
        journals: { with: { journal: true } },
        notes: { with: { note: true } },
      },
    });

    const domainItems: ExpertiseItemDTO[] = [];
    for (const d of domainRows) {
      const validProjects = d.projects.filter(
        (p) =>
          p.project &&
          p.project.visibility === 'public' &&
          p.project.publicationStatus === 'published' &&
          !p.project.archivedAt
      );
      const validExperiences = d.experiences.filter(
        (e) =>
          e.experience &&
          e.experience.visibility === 'public' &&
          e.experience.publicationStatus === 'published' &&
          !e.experience.archivedAt
      );
      const validArticles = d.articles.filter(
        (a) =>
          a.article &&
          a.article.visibility === 'public' &&
          a.article.publicationStatus === 'published' &&
          !a.article.archivedAt
      );
      const validNotes = d.notes.filter(
        (n) =>
          n.note &&
          n.note.visibility === 'public' &&
          n.note.publicationStatus === 'published' &&
          !n.note.archivedAt
      );
      const validJournals = d.journals.filter(
        (j) =>
          j.journal &&
          j.journal.visibility === 'public' &&
          j.journal.publicationStatus === 'published' &&
          !j.journal.archivedAt
      );

      const knowledgeList = [
        ...validArticles.map((a) => ({
          title: a.article.title,
          slug: a.article.slug,
          entityType: 'ARTICLE' as const,
          href: `/articles/${a.article.slug}`,
        })),
        ...validNotes.map((n) => ({
          title: n.note.title,
          slug: n.note.slug,
          entityType: 'TECH_NOTE' as const,
          href: `/notes/${n.note.slug}`,
        })),
        ...validJournals.map((j) => ({
          title: j.journal.title,
          slug: j.journal.slug,
          entityType: 'JOURNAL_ENTRY' as const,
          href: `/journal/${j.journal.slug}`,
        })),
      ];

      const totalEvidence = validProjects.length + validExperiences.length + knowledgeList.length;

      if (totalEvidence > 0) {
        domainItems.push({
          slug: d.slug,
          name: d.name,
          category: 'DOMAIN_PILLAR',
          description: d.description,
          type: 'DOMAIN',
          evidenceCount: {
            projects: validProjects.length,
            experiences: validExperiences.length,
            knowledge: knowledgeList.length,
            certificates: 0,
            total: totalEvidence,
          },
          representativeProjects: validProjects.slice(0, 3).map((p) => ({
            title: p.project.title,
            slug: p.project.slug,
          })),
          representativeKnowledge: knowledgeList.slice(0, 3),
          linkedCertificates: [],
        });
      }
    }

    // 2. Technologies
    const techRows = await db.query.technologies.findMany({
      where: and(eq(technologies.visibility, 'public'), isNull(technologies.archivedAt)),
      with: {
        projects: { with: { project: true } },
        experiences: { with: { experience: true } },
        articles: { with: { article: true } },
        journals: { with: { journal: true } },
        notes: { with: { note: true } },
        certificates: { with: { certificate: true } },
      },
    });

    const techItems: ExpertiseItemDTO[] = [];
    for (const t of techRows) {
      const validProjects = t.projects.filter(
        (p) =>
          p.project &&
          p.project.visibility === 'public' &&
          p.project.publicationStatus === 'published' &&
          !p.project.archivedAt
      );
      const validExperiences = t.experiences.filter(
        (e) =>
          e.experience &&
          e.experience.visibility === 'public' &&
          e.experience.publicationStatus === 'published' &&
          !e.experience.archivedAt
      );
      const validArticles = t.articles.filter(
        (a) =>
          a.article &&
          a.article.visibility === 'public' &&
          a.article.publicationStatus === 'published' &&
          !a.article.archivedAt
      );
      const validNotes = t.notes.filter(
        (n) =>
          n.note &&
          n.note.visibility === 'public' &&
          n.note.publicationStatus === 'published' &&
          !n.note.archivedAt
      );
      const validJournals = t.journals.filter(
        (j) =>
          j.journal &&
          j.journal.visibility === 'public' &&
          j.journal.publicationStatus === 'published' &&
          !j.journal.archivedAt
      );

      const knowledgeList = [
        ...validArticles.map((a) => ({
          title: a.article.title,
          slug: a.article.slug,
          entityType: 'ARTICLE' as const,
          href: `/articles/${a.article.slug}`,
        })),
        ...validNotes.map((n) => ({
          title: n.note.title,
          slug: n.note.slug,
          entityType: 'TECH_NOTE' as const,
          href: `/notes/${n.note.slug}`,
        })),
        ...validJournals.map((j) => ({
          title: j.journal.title,
          slug: j.journal.slug,
          entityType: 'JOURNAL_ENTRY' as const,
          href: `/journal/${j.journal.slug}`,
        })),
      ];

      const validCerts = t.certificates
        .filter(
          (c) =>
            c.certificate &&
            c.certificate.visibility === 'public' &&
            c.certificate.publicationStatus === 'published' &&
            !c.certificate.archivedAt
        )
        .map((c) => ({
          name: c.certificate.name,
          issuer: c.certificate.issuer,
          issueYear: c.certificate.issuedAt ? new Date(c.certificate.issuedAt).getFullYear() : null,
          verificationUrl: sanitizePublicUrl(c.certificate.credentialUrl),
        }));

      const nonCertEvidence = validProjects.length + validExperiences.length + knowledgeList.length;

      if (nonCertEvidence > 0) {
        techItems.push({
          slug: t.slug,
          name: t.name,
          category: t.category || 'CORE_TECH',
          description: t.description,
          type: 'TECHNOLOGY',
          evidenceCount: {
            projects: validProjects.length,
            experiences: validExperiences.length,
            knowledge: knowledgeList.length,
            certificates: validCerts.length,
            total: nonCertEvidence + validCerts.length,
          },
          representativeProjects: validProjects.slice(0, 3).map((p) => ({
            title: p.project.title,
            slug: p.project.slug,
          })),
          representativeKnowledge: knowledgeList.slice(0, 3),
          linkedCertificates: validCerts,
        });
      }
    }

    // 3. Skills
    const skillRows = await db.query.skills.findMany({
      where: and(eq(skills.visibility, 'public'), isNull(skills.archivedAt)),
      with: {
        projects: { with: { project: true } },
        experiences: { with: { experience: true } },
        articles: { with: { article: true } },
        journals: { with: { journal: true } },
        notes: { with: { note: true } },
        certificates: { with: { certificate: true } },
      },
    });

    const skillItems: ExpertiseItemDTO[] = [];
    for (const s of skillRows) {
      const validProjects = s.projects.filter(
        (p) =>
          p.project &&
          p.project.visibility === 'public' &&
          p.project.publicationStatus === 'published' &&
          !p.project.archivedAt
      );
      const validExperiences = s.experiences.filter(
        (e) =>
          e.experience &&
          e.experience.visibility === 'public' &&
          e.experience.publicationStatus === 'published' &&
          !e.experience.archivedAt
      );
      const validArticles = s.articles.filter(
        (a) =>
          a.article &&
          a.article.visibility === 'public' &&
          a.article.publicationStatus === 'published' &&
          !a.article.archivedAt
      );
      const validNotes = s.notes.filter(
        (n) =>
          n.note &&
          n.note.visibility === 'public' &&
          n.note.publicationStatus === 'published' &&
          !n.note.archivedAt
      );
      const validJournals = s.journals.filter(
        (j) =>
          j.journal &&
          j.journal.visibility === 'public' &&
          j.journal.publicationStatus === 'published' &&
          !j.journal.archivedAt
      );

      const knowledgeList = [
        ...validArticles.map((a) => ({
          title: a.article.title,
          slug: a.article.slug,
          entityType: 'ARTICLE' as const,
          href: `/articles/${a.article.slug}`,
        })),
        ...validNotes.map((n) => ({
          title: n.note.title,
          slug: n.note.slug,
          entityType: 'TECH_NOTE' as const,
          href: `/notes/${n.note.slug}`,
        })),
        ...validJournals.map((j) => ({
          title: j.journal.title,
          slug: j.journal.slug,
          entityType: 'JOURNAL_ENTRY' as const,
          href: `/journal/${j.journal.slug}`,
        })),
      ];

      const validCerts = s.certificates
        .filter(
          (c) =>
            c.certificate &&
            c.certificate.visibility === 'public' &&
            c.certificate.publicationStatus === 'published' &&
            !c.certificate.archivedAt
        )
        .map((c) => ({
          name: c.certificate.name,
          issuer: c.certificate.issuer,
          issueYear: c.certificate.issuedAt ? new Date(c.certificate.issuedAt).getFullYear() : null,
          verificationUrl: sanitizePublicUrl(c.certificate.credentialUrl),
        }));

      const nonCertEvidence = validProjects.length + validExperiences.length + knowledgeList.length;

      if (nonCertEvidence > 0) {
        skillItems.push({
          slug: s.slug,
          name: s.name,
          category: s.category || 'ENGINEERING_SKILL',
          description: s.description,
          type: 'SKILL',
          evidenceCount: {
            projects: validProjects.length,
            experiences: validExperiences.length,
            knowledge: knowledgeList.length,
            certificates: validCerts.length,
            total: nonCertEvidence + validCerts.length,
          },
          representativeProjects: validProjects.slice(0, 3).map((p) => ({
            title: p.project.title,
            slug: p.project.slug,
          })),
          representativeKnowledge: knowledgeList.slice(0, 3),
          linkedCertificates: validCerts,
        });
      }
    }

    return {
      domains: domainItems.sort((a, b) => b.evidenceCount.total - a.evidenceCount.total),
      technologies: techItems.sort((a, b) => b.evidenceCount.total - a.evidenceCount.total),
      skills: skillItems.sort((a, b) => b.evidenceCount.total - a.evidenceCount.total),
    };
  }

  // =========================================================================
  // 4. KNOWLEDGE HUB READ MODEL (/system)
  // =========================================================================

  /**
   * Retrieves public knowledge hub feed (Amendments 14, 15).
   */
  static async getKnowledgeHub(params?: {
    type?: string;
    domain?: string;
    technology?: string;
    tag?: string;
    q?: string;
  }): Promise<KnowledgeHubItemDTO[]> {
    const items: KnowledgeHubItemDTO[] = [];

    // 1. Articles
    if (!params?.type || params.type === 'ARTICLE') {
      const articleRows = await db.query.articles.findMany({
        where: and(
          eq(articles.visibility, 'public'),
          eq(articles.publicationStatus, 'published'),
          lte(articles.publishedAt, sql`now()`),
          isNull(articles.archivedAt)
        ),
        orderBy: [desc(articles.publishedAt)],
        with: {
          tags: { with: { tag: true } },
          domains: { with: { domain: true } },
          technologies: { with: { technology: true } },
        },
      });

      for (const a of articleRows) {
        if (params?.q) {
          const q = params.q.toLowerCase();
          if (!a.title.toLowerCase().includes(q) && !a.excerpt?.toLowerCase().includes(q)) {
            continue;
          }
        }
        items.push({
          entityType: 'ARTICLE',
          title: a.title,
          slug: a.slug,
          summary: a.excerpt || a.subtitle,
          publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
          readingTimeMinutes: a.readingTimeMinutes,
          href: `/articles/${a.slug}`,
          domains: a.domains.map((d) => ({ name: d.domain.name, slug: d.domain.slug, color: null, icon: null })),
          technologies: a.technologies.map((t) => ({ name: t.technology.name, slug: t.technology.slug, color: null, icon: t.technology.iconName })),
          tags: a.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
        });
      }
    }

    // 2. Tech Notes
    if (!params?.type || params.type === 'TECH_NOTE') {
      const noteRows = await db.query.notes.findMany({
        where: and(
          eq(notes.visibility, 'public'),
          eq(notes.publicationStatus, 'published'),
          lte(notes.publishedAt, sql`now()`),
          isNull(notes.archivedAt)
        ),
        orderBy: [desc(notes.publishedAt)],
        with: {
          tags: { with: { tag: true } },
          domains: { with: { domain: true } },
          technologies: { with: { technology: true } },
        },
      });

      for (const n of noteRows) {
        if (params?.q) {
          const q = params.q.toLowerCase();
          if (!n.title.toLowerCase().includes(q) && !n.summary?.toLowerCase().includes(q)) {
            continue;
          }
        }
        items.push({
          entityType: 'TECH_NOTE',
          title: n.title,
          slug: n.slug,
          summary: n.summary,
          publishedAt: n.publishedAt ? n.publishedAt.toISOString() : null,
          href: `/notes/${n.slug}`,
          domains: n.domains.map((d) => ({ name: d.domain.name, slug: d.domain.slug, color: null, icon: null })),
          technologies: n.technologies.map((t) => ({ name: t.technology.name, slug: t.technology.slug, color: null, icon: t.technology.iconName })),
          tags: n.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
        });
      }
    }

    // 3. ADRs
    if (!params?.type || params.type === 'ADR') {
      const adrRows = await db.query.adrs.findMany({
        where: and(
          eq(adrs.visibility, 'public'),
          eq(adrs.publicationStatus, 'published'),
          lte(adrs.publishedAt, sql`now()`),
          isNull(adrs.archivedAt)
        ),
        orderBy: [desc(adrs.number)],
      });

      for (const ad of adrRows) {
        if (params?.q) {
          const q = params.q.toLowerCase();
          if (!ad.title.toLowerCase().includes(q) && !ad.decision?.toLowerCase().includes(q)) {
            continue;
          }
        }
        items.push({
          entityType: 'ADR',
          title: ad.title,
          slug: ad.slug,
          summary: ad.decision,
          publishedAt: ad.publishedAt ? ad.publishedAt.toISOString() : null,
          adrNumber: ad.number,
          adrStatus: ad.status,
          href: `/adrs/${ad.slug}`,
          domains: [],
          technologies: [],
          tags: [],
        });
      }
    }

    // 4. Journal Entries
    if (!params?.type || params.type === 'JOURNAL_ENTRY') {
      const journalRows = await db.query.journalEntries.findMany({
        where: and(
          eq(journalEntries.visibility, 'public'),
          eq(journalEntries.publicationStatus, 'published'),
          lte(journalEntries.publishedAt, sql`now()`),
          isNull(journalEntries.archivedAt)
        ),
        orderBy: [desc(journalEntries.entryDate)],
        with: {
          tags: { with: { tag: true } },
          domains: { with: { domain: true } },
          technologies: { with: { technology: true } },
        },
      });

      for (const j of journalRows) {
        if (params?.q) {
          const q = params.q.toLowerCase();
          if (!j.title.toLowerCase().includes(q) && !j.summary?.toLowerCase().includes(q)) {
            continue;
          }
        }
        items.push({
          entityType: 'JOURNAL_ENTRY',
          title: j.title,
          slug: j.slug,
          summary: j.summary,
          publishedAt: j.publishedAt ? j.publishedAt.toISOString() : null,
          href: `/journal/${j.slug}`,
          domains: j.domains.map((d) => ({ name: d.domain.name, slug: d.domain.slug, color: null, icon: null })),
          technologies: j.technologies.map((t) => ({ name: t.technology.name, slug: t.technology.slug, color: null, icon: t.technology.iconName })),
          tags: j.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
        });
      }
    }

    return items;
  }

  // =========================================================================
  // 5. CANONICAL KNOWLEDGE DETAIL ROUTES
  // =========================================================================

  static async getArticleBySlug(slug: string): Promise<KnowledgeDetailDTO | null> {
    const row = await db.query.articles.findFirst({
      where: and(
        eq(articles.slug, slug),
        inArray(articles.visibility, ['public', 'unlisted']),
        eq(articles.publicationStatus, 'published'),
        lte(articles.publishedAt, sql`now()`),
        isNull(articles.archivedAt)
      ),
      with: {
        tags: { with: { tag: true } },
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
        skills: { with: { skill: true } },
      },
    });

    if (!row) return null;
    const relatedKnowledge = await this.getRelatedPublicKnowledge('ARTICLE', row.id, 4);

    return {
      entityType: 'ARTICLE',
      title: row.title,
      slug: row.slug,
      subtitle: row.subtitle,
      excerpt: row.excerpt,
      content: row.content,
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      readingTimeMinutes: row.readingTimeMinutes,
      tags: row.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
      domains: row.domains.map((d) => ({ name: d.domain.name, slug: d.domain.slug, color: null, icon: null })),
      technologies: row.technologies.map((t) => ({ name: t.technology.name, slug: t.technology.slug, color: null, icon: t.technology.iconName })),
      skills: row.skills.map((s) => ({ name: s.skill.name, slug: s.skill.slug })),
      relatedKnowledge,
      isUnlisted: row.visibility === 'unlisted',
    };
  }

  static async getNoteBySlug(slug: string): Promise<KnowledgeDetailDTO | null> {
    const row = await db.query.notes.findFirst({
      where: and(
        eq(notes.slug, slug),
        inArray(notes.visibility, ['public', 'unlisted']),
        eq(notes.publicationStatus, 'published'),
        lte(notes.publishedAt, sql`now()`),
        isNull(notes.archivedAt)
      ),
      with: {
        tags: { with: { tag: true } },
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
        skills: { with: { skill: true } },
      },
    });

    if (!row) return null;
    const relatedKnowledge = await this.getRelatedPublicKnowledge('TECH_NOTE', row.id, 4);

    return {
      entityType: 'TECH_NOTE',
      title: row.title,
      slug: row.slug,
      excerpt: row.summary,
      content: row.content,
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      tags: row.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
      domains: row.domains.map((d) => ({ name: d.domain.name, slug: d.domain.slug, color: null, icon: null })),
      technologies: row.technologies.map((t) => ({ name: t.technology.name, slug: t.technology.slug, color: null, icon: t.technology.iconName })),
      skills: row.skills.map((s) => ({ name: s.skill.name, slug: s.skill.slug })),
      relatedKnowledge,
      isUnlisted: row.visibility === 'unlisted',
    };
  }

  static async getAdrBySlug(slug: string): Promise<KnowledgeDetailDTO | null> {
    const row = await db.query.adrs.findFirst({
      where: and(
        eq(adrs.slug, slug),
        inArray(adrs.visibility, ['public', 'unlisted']),
        eq(adrs.publicationStatus, 'published'),
        lte(adrs.publishedAt, sql`now()`),
        isNull(adrs.archivedAt)
      ),
    });

    if (!row) return null;
    const relatedKnowledge = await this.getRelatedPublicKnowledge('ADR', row.id, 4);

    return {
      entityType: 'ADR',
      title: row.title,
      slug: row.slug,
      content: row.decision || '',
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      adrNumber: row.number,
      adrStatus: row.status,
      adrContext: row.context,
      adrDecision: row.decision,
      adrConsequences: typeof row.consequences === 'string' ? row.consequences : JSON.stringify(row.consequences) || null,
      tags: [],
      domains: [],
      technologies: [],
      skills: [],
      relatedKnowledge,
      isUnlisted: row.visibility === 'unlisted',
    };
  }

  static async getJournalBySlug(slug: string): Promise<KnowledgeDetailDTO | null> {
    const row = await db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.slug, slug),
        inArray(journalEntries.visibility, ['public', 'unlisted']),
        eq(journalEntries.publicationStatus, 'published'),
        lte(journalEntries.publishedAt, sql`now()`),
        isNull(journalEntries.archivedAt)
      ),
      with: {
        tags: { with: { tag: true } },
        domains: { with: { domain: true } },
        technologies: { with: { technology: true } },
        skills: { with: { skill: true } },
      },
    });

    if (!row) return null;
    const relatedKnowledge = await this.getRelatedPublicKnowledge('JOURNAL_ENTRY', row.id, 4);

    return {
      entityType: 'JOURNAL_ENTRY',
      title: row.title,
      slug: row.slug,
      excerpt: row.summary,
      content: row.content,
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      journalDate: row.entryDate,
      tags: row.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug })),
      domains: row.domains.map((d) => ({ name: d.domain.name, slug: d.domain.slug, color: null, icon: null })),
      technologies: row.technologies.map((t) => ({ name: t.technology.name, slug: t.technology.slug, color: null, icon: t.technology.iconName })),
      skills: row.skills.map((s) => ({ name: s.skill.name, slug: s.skill.slug })),
      relatedKnowledge,
      isUnlisted: row.visibility === 'unlisted',
    };
  }

  // =========================================================================
  // 6. NOW READ MODEL (/now)
  // =========================================================================

  /**
   * Current attention streams grouped by category (Amendment 11).
   */
  static async getNowPublic(): Promise<NowPublicDTO> {
    const rows = await db.query.nowEntries.findMany({
      where: and(
        eq(nowEntries.visibility, 'public'),
        eq(nowEntries.publicationStatus, 'published'),
        isNull(nowEntries.archivedAt)
      ),
      orderBy: [desc(nowEntries.status), desc(nowEntries.updatedAt)],
      with: {
        projects: { with: { project: true } },
      },
    });

    const activeEntries: NowEntryPublicDTO[] = [];
    const recentCompletedEntries: NowEntryPublicDTO[] = [];
    const categories: Record<string, NowEntryPublicDTO[]> = {};

    let latestUpdated: Date | null = null;

    for (const n of rows) {
      if (!latestUpdated || (n.updatedAt && n.updatedAt > latestUpdated)) {
        latestUpdated = n.updatedAt;
      }

      const linkedProject =
        n.projects[0]?.project &&
        n.projects[0].project.visibility === 'public' &&
        n.projects[0].project.publicationStatus === 'published' &&
        !n.projects[0].project.archivedAt
          ? {
              title: n.projects[0].project.title,
              slug: n.projects[0].project.slug,
            }
          : null;

      const category = (n.entryType?.toUpperCase() || 'BUILDING') as NowCategory;
      const status = (n.status === 'completed' ? 'COMPLETED' : 'ACTIVE') as 'ACTIVE' | 'COMPLETED';

      const item: NowEntryPublicDTO = {
        title: n.title,
        description: n.description,
        category,
        status,
        progressPercent: null,
        startedAt: n.startedAt || null,
        completedAt: n.endedAt || null,
        contextUrl: null,
        contextTitle: null,
        linkedProject,
        linkedKnowledge: null,
      };

      if (status === 'ACTIVE') {
        activeEntries.push(item);
        if (!categories[category]) categories[category] = [];
        categories[category].push(item);
      } else {
        if (recentCompletedEntries.length < 5) {
          recentCompletedEntries.push(item);
        }
      }
    }

    return {
      lastUpdated: latestUpdated ? latestUpdated.toISOString() : null,
      activeEntries,
      recentCompletedEntries,
      categories,
    };
  }

  // =========================================================================
  // 7. ABOUT READ MODEL (/about)
  // =========================================================================

  /**
   * Whitelist projection for Public Profile (Amendment 22).
   */
  static async getAboutPublic(): Promise<AboutPublicDTO> {
    const prof = await db.query.profiles.findFirst();

    const profileDTO: PublicProfileDTO = {
      fullName: prof?.fullName || 'Khalid Jundullah',
      headline: prof?.headline || 'Network & Systems Engineer | Developer OS Architect',
      bio: prof?.bio || 'Engineering high-reliability network infrastructure, distributed systems, and modern web architectures.',
      location: prof?.location || 'Jakarta, Indonesia',
      email: prof?.emailPublic || 'harinzu47@gmail.com',
      githubUrl: sanitizePublicUrl(prof?.githubUrl || 'https://github.com/Harinzu47'),
      linkedinUrl: sanitizePublicUrl(prof?.linkedinUrl || 'https://www.linkedin.com/in/khalid-jundullah-8086b8249'),
      avatarUrl: prof?.avatarPath ? sanitizePublicUrl(prof.avatarPath) : null,
      availabilityStatus: prof?.availabilityStatus || 'available',
    };

    const principles = [
      {
        title: 'Infrastructure as Code & Predictable Systems',
        description: 'Systems should be reproducible, auditable, and resilient by design. Ephemeral runtime, deterministic configuration.',
      },
      {
        title: 'Evidence Over Assertions',
        description: 'Engineering claims must be substantiated with verifiable code, benchmarks, architectural decisions, and production metrics.',
      },
      {
        title: 'Continuous Synthesis & Learning in Public',
        description: 'Daily investigation logs refine into operational tech notes, architectural decision records, and long-form essays.',
      },
    ];

    const workingStyle = [
      {
        title: 'Autonomous & Rigorous',
        description: 'End-to-end ownership from kernel routing and database constraints to type-safe client interfaces.',
      },
      {
        title: 'Fail-Closed Security',
        description: 'Row-level security, least-privilege policies, and zero-trust verification across every API boundary.',
      },
    ];

    return {
      profile: profileDTO,
      principles,
      workingStyle,
      currentFocusSummary: 'Building resilient developer platforms, distributed services, and learning in public.',
    };
  }

  // =========================================================================
  // 8. HOME READ MODEL (/)
  // =========================================================================

  /**
   * Composes server-side read model for Home / page (Amendments 32, 33).
   */
  static async getHomePublic(): Promise<HomePublicDTO> {
    const [aboutData, workIndex, expTimeline, nowData, knowledgeHub, expertise] = await Promise.all([
      this.getAboutPublic(),
      this.getWorkIndex(),
      this.getExperienceTimeline(),
      this.getNowPublic(),
      this.getKnowledgeHub(),
      this.getExpertiseReadModel(),
    ]);

    const featuredProjects = workIndex.filter((p) => p.featured).slice(0, 3);
    const fallbackProjects = featuredProjects.length > 0 ? featuredProjects : workIndex.slice(0, 3);

    const currentExperience =
      expTimeline.experiences.find((e) => e.isCurrent) || expTimeline.experiences[0] || null;

    const currentNow = nowData.activeEntries.slice(0, 2);
    const selectedKnowledge = knowledgeHub.slice(0, 2);
    const topCapabilities = [...expertise.domains, ...expertise.technologies, ...expertise.skills].slice(0, 4);

    return {
      hero: aboutData.profile,
      featuredProjects: fallbackProjects,
      currentExperience,
      currentNow,
      selectedKnowledge,
      topCapabilities,
    };
  }

  // =========================================================================
  // 9. HELPER: BOUNDED DEPTH-1 RELATED PUBLIC KNOWLEDGE
  // =========================================================================

  /**
   * Helper to fetch depth-1 related knowledge items for an entity (Amendment 34).
   */
  private static async getRelatedPublicKnowledge(
    sourceType: string,
    sourceId: string,
    limit: number = 4
  ): Promise<RelatedKnowledgeItemDTO[]> {
    try {
      const relRows = await db.query.knowledgeRelationships.findMany({
        where: and(
          eq(knowledgeRelationships.sourceType, sourceType),
          eq(knowledgeRelationships.sourceId, sourceId),
          eq(knowledgeRelationships.status, 'active')
        ),
        limit: limit * 2,
      });

      const related: RelatedKnowledgeItemDTO[] = [];

      for (const rel of relRows) {
        if (related.length >= limit) break;

        switch (rel.targetType) {
          case 'ARTICLE': {
            const row = await db.query.articles.findFirst({
              where: and(
                eq(articles.id, rel.targetId),
                eq(articles.visibility, 'public'),
                eq(articles.publicationStatus, 'published'),
                isNull(articles.archivedAt)
              ),
              columns: { title: true, slug: true, excerpt: true, publishedAt: true },
            });
            if (row) {
              related.push({
                title: row.title,
                slug: row.slug,
                summary: row.excerpt,
                entityType: 'ARTICLE',
                href: `/articles/${row.slug}`,
                publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
              });
            }
            break;
          }

          case 'TECH_NOTE': {
            const row = await db.query.notes.findFirst({
              where: and(
                eq(notes.id, rel.targetId),
                eq(notes.visibility, 'public'),
                eq(notes.publicationStatus, 'published'),
                isNull(notes.archivedAt)
              ),
              columns: { title: true, slug: true, summary: true, publishedAt: true },
            });
            if (row) {
              related.push({
                title: row.title,
                slug: row.slug,
                summary: row.summary,
                entityType: 'TECH_NOTE',
                href: `/notes/${row.slug}`,
                publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
              });
            }
            break;
          }

          case 'ADR': {
            const row = await db.query.adrs.findFirst({
              where: and(
                eq(adrs.id, rel.targetId),
                eq(adrs.visibility, 'public'),
                eq(adrs.publicationStatus, 'published'),
                isNull(adrs.archivedAt)
              ),
              columns: { title: true, slug: true, decision: true, publishedAt: true },
            });
            if (row) {
              related.push({
                title: row.title,
                slug: row.slug,
                summary: row.decision,
                entityType: 'ADR',
                href: `/adrs/${row.slug}`,
                publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
              });
            }
            break;
          }

          case 'JOURNAL_ENTRY': {
            const row = await db.query.journalEntries.findFirst({
              where: and(
                eq(journalEntries.id, rel.targetId),
                eq(journalEntries.visibility, 'public'),
                eq(journalEntries.publicationStatus, 'published'),
                isNull(journalEntries.archivedAt)
              ),
              columns: { title: true, slug: true, summary: true, publishedAt: true },
            });
            if (row) {
              related.push({
                title: row.title,
                slug: row.slug,
                summary: row.summary,
                entityType: 'JOURNAL_ENTRY',
                href: `/journal/${row.slug}`,
                publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
              });
            }
            break;
          }
        }
      }

      return related;
    } catch {
      return [];
    }
  }
}
