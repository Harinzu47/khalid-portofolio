import { db } from '@/db/client';
import {
  articles,
  articleTags,
  articleProjects,
  articleSkills,
  articleDomains,
  articleTechnologies,
  tags,
  media,
} from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { ArticleFormInput } from '@/validations/article';
import type { KnowledgeListItemDTO, ArticleEditorDTO, PaginatedResultDTO } from '@/types/dtos';

/**
 * Resolves both tag IDs and raw tag names transactionally per Amendment 3.
 */
async function resolveTagIds(
  tx: any,
  ownerId: string,
  tagIds: string[] = [],
  tagNames: string[] = []
): Promise<string[]> {
  const resolvedIds = new Set<string>(tagIds);

  for (const rawName of tagNames) {
    const cleanName = rawName.trim();
    if (!cleanName) continue;
    const tagSlug = slugify(cleanName);

    let tag = await tx.query.tags.findFirst({
      where: and(eq(tags.slug, tagSlug), eq(tags.ownerId, ownerId)),
    });

    if (!tag) {
      const [createdTag] = await tx
        .insert(tags)
        .values({
          ownerId,
          name: cleanName,
          slug: tagSlug,
          visibility: 'private',
        })
        .returning();
      tag = createdTag;
    }

    if (tag) {
      resolvedIds.add(tag.id);
    }
  }

  return Array.from(resolvedIds);
}

export class ArticlesService {
  /**
   * Alias for getArticles
   */
  static getPublicArticles(params?: PaginationParams) {
    return ArticlesService.getArticles(params);
  }

  /**
   * Alias for getArticleBySlug
   */
  static getPublicArticleBySlug(slug: string) {
    return ArticlesService.getArticleBySlug(slug);
  }

  /**
   * Public query: Retrieves paginated published public articles.
   */
  static async getArticles(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 10);

    const conditions = and(
      eq(articles.status, 'published'),
      eq(articles.visibility, 'public'),
      eq(articles.publicationStatus, 'published'),
      sql`${articles.publishedAt} IS NOT NULL`,
      isNull(articles.deletedAt),
      isNull(articles.archivedAt)
    );

    const [data, countResult] = await Promise.all([
      db.query.articles.findMany({
        where: conditions,
        orderBy: [desc(articles.publishedAt)],
        limit,
        offset,
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
          projects: {
            with: {
              project: true,
            },
          },
          domains: {
            with: {
              domain: true,
            },
          },
          skills: {
            with: {
              skill: true,
            },
          },
          technologies: {
            with: {
              technology: true,
            },
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(articles)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    return formatPaginatedResult(data, totalRecords, page, pageSize);
  }

  /**
   * Public query: Retrieves single published article by slug.
   */
  static async getArticleBySlug(slug: string) {
    const article = await db.query.articles.findFirst({
      where: and(
        eq(articles.slug, slug),
        eq(articles.status, 'published'),
        eq(articles.visibility, 'public'),
        eq(articles.publicationStatus, 'published'),
        sql`${articles.publishedAt} IS NOT NULL`,
        isNull(articles.deletedAt),
        isNull(articles.archivedAt)
      ),
      with: {
        tags: {
          with: {
            tag: true,
          },
        },
        projects: {
          with: {
            project: true,
          },
        },
        domains: {
          with: {
            domain: true,
          },
        },
        skills: {
          with: {
            skill: true,
          },
        },
        technologies: {
          with: {
            technology: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundError('Article', slug);
    }

    return article;
  }

  /**
   * Owner-scoped query: Retrieves paginated articles for the Admin Knowledge Surface.
   */
  static async getAdminArticles(
    ownerId: string,
    params?: PaginationParams
  ): Promise<PaginatedResultDTO<KnowledgeListItemDTO>> {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 25);

    const conditions = and(eq(articles.ownerId, ownerId), isNull(articles.deletedAt));

    const [data, countResult] = await Promise.all([
      db.query.articles.findMany({
        where: conditions,
        orderBy: [desc(articles.createdAt)],
        limit,
        offset,
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
          domains: {
            with: {
              domain: true,
            },
          },
          technologies: {
            with: {
              technology: true,
            },
          },
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(articles)
        .where(conditions),
    ]);

    const totalRecords = countResult[0]?.count || 0;
    const formattedData: KnowledgeListItemDTO[] = data.map((a) => ({
      id: a.id,
      entityType: 'article' as const,
      title: a.title,
      slug: a.slug,
      summary: a.excerpt,
      visibility: a.visibility as any,
      publicationStatus: a.publicationStatus as any,
      status: a.status,
      isFeatured: a.featured,
      domains: (a.domains || []).map((d: any) => ({
        id: d.domain.id,
        name: d.domain.name,
        slug: d.domain.slug,
      })),
      technologies: (a.technologies || []).map((t: any) => ({
        id: t.technology.id,
        name: t.technology.name,
        slug: t.technology.slug,
      })),
      tags: (a.tags || []).map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
      })),
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      updatedAt: a.updatedAt.toISOString(),
    }));

    return formatPaginatedResult(formattedData, totalRecords, page, pageSize);
  }

  /**
   * Owner-scoped query: Retrieves article by ID for editor.
   */
  static async getArticleEditorById(
    ownerId: string,
    id: string,
    executor: any = db
  ): Promise<ArticleEditorDTO> {
    const article = await executor.query.articles.findFirst({
      where: and(eq(articles.id, id), eq(articles.ownerId, ownerId), isNull(articles.deletedAt)),
      with: {
        tags: {
          with: {
            tag: true,
          },
        },
        projects: {
          with: {
            project: true,
          },
        },
        domains: {
          with: {
            domain: true,
          },
        },
        skills: {
          with: {
            skill: true,
          },
        },
        technologies: {
          with: {
            technology: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundError('Article', id);
    }

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      subtitle: article.subtitle,
      excerpt: article.excerpt,
      content: article.content,
      status: article.status,
      readingTimeMinutes: article.readingTimeMinutes,
      revision: article.revision,
      featured: article.featured,
      visibility: article.visibility as any,
      publicationStatus: article.publicationStatus as any,
      publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
      lastReviewedAt: article.lastReviewedAt ? article.lastReviewedAt.toISOString() : null,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      ogImageId: article.ogImageId,
      archivedAt: article.archivedAt ? article.archivedAt.toISOString() : null,
      domains: (article.domains || []).map((d: any) => ({
        id: d.domain.id,
        name: d.domain.name,
        slug: d.domain.slug,
      })),
      skills: (article.skills || []).map((s: any) => ({
        id: s.skill.id,
        name: s.skill.name,
        slug: s.skill.slug,
      })),
      technologies: (article.technologies || []).map((t: any) => ({
        id: t.technology.id,
        name: t.technology.name,
        slug: t.technology.slug,
        iconName: t.technology.iconName,
      })),
      tags: (article.tags || []).map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
      })),
      projectIds: (article.projects || []).map((p: any) => p.projectId),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }

  /**
   * Creates a new article atomically with owner isolation and transactional junction sync.
   * Invariant: Sets publicationStatus = 'draft' by default per Section 8 & Amendment 11.
   */
  static async createArticle(
    ownerId: string,
    input: ArticleFormInput,
    actorId?: string
  ): Promise<ArticleEditorDTO> {
    const finalSlug = input.slug?.trim() || slugify(input.title);

    const existing = await db.query.articles.findFirst({
      where: eq(articles.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`An article with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      // Validate ogImageId ownership if provided (Amendment 24, 54)
      if (input.ogImageId) {
        const mediaAsset = await tx.query.media.findFirst({
          where: and(eq(media.id, input.ogImageId), eq(media.ownerId, ownerId)),
        });
        if (!mediaAsset) {
          throw new NotFoundError('Media', input.ogImageId);
        }
      }

      const [newArticle] = await tx
        .insert(articles)
        .values({
          ownerId,
          title: input.title.trim(),
          slug: finalSlug,
          subtitle: input.subtitle || null,
          excerpt: input.excerpt || null,
          content: input.content,
          readingTimeMinutes: input.readingTimeMinutes || null,
          featured: input.featured || false,
          visibility: input.visibility || 'private',
          publicationStatus: 'draft', // Strict DRAFT default
          seoTitle: input.seoTitle || null,
          seoDescription: input.seoDescription || null,
          ogImageId: input.ogImageId || null,
        })
        .returning();

      // 1. Resolve and Sync Tags
      const allTagIds = await resolveTagIds(tx, ownerId, input.tagIds, input.tagNames);
      if (allTagIds.length > 0) {
        await tx.insert(articleTags).values(
          allTagIds.map((tagId) => ({
            articleId: newArticle.id,
            tagId,
          }))
        );
      }

      // 2. Sync Projects
      if (input.projectIds && input.projectIds.length > 0) {
        await tx.insert(articleProjects).values(
          input.projectIds.map((projectId) => ({
            articleId: newArticle.id,
            projectId,
          }))
        );
      }

      // 3. Sync Domains
      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(articleDomains).values(
          input.domainIds.map((domainId) => ({
            articleId: newArticle.id,
            domainId,
          }))
        );
      }

      // 4. Sync Skills
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(articleSkills).values(
          input.skillIds.map((skillId) => ({
            articleId: newArticle.id,
            skillId,
          }))
        );
      }

      // 5. Sync Technologies
      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(articleTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            articleId: newArticle.id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ARTICLE_CREATE',
        entityType: 'article',
        entityId: newArticle.id,
        newValues: newArticle,
      });

      return await ArticlesService.getArticleEditorById(ownerId, newArticle.id, tx);
    });
  }

  /**
   * Updates an existing article atomically (Owner scoped).
   * Note: Does NOT modify publicationStatus (reserved for PublishingService).
   */
  static async updateArticle(
    ownerId: string,
    id: string,
    input: Partial<ArticleFormInput>,
    actorId?: string
  ): Promise<ArticleEditorDTO> {
    const existing = await db.query.articles.findFirst({
      where: and(eq(articles.id, id), eq(articles.ownerId, ownerId), isNull(articles.deletedAt)),
    });

    if (!existing) {
      throw new NotFoundError('Article', id);
    }

    const finalSlug =
      input.slug?.trim() || (input.title ? slugify(input.title) : existing.slug);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.articles.findFirst({
        where: and(eq(articles.slug, finalSlug), sql`${articles.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already in use.`);
      }
    }

    return await db.transaction(async (tx) => {
      // Validate ogImageId ownership if updated (Amendment 24, 54)
      if (input.ogImageId) {
        const mediaAsset = await tx.query.media.findFirst({
          where: and(eq(media.id, input.ogImageId), eq(media.ownerId, ownerId)),
        });
        if (!mediaAsset) {
          throw new NotFoundError('Media', input.ogImageId);
        }
      }

      const [updatedArticle] = await tx
        .update(articles)
        .set({
          title: input.title !== undefined ? input.title.trim() : existing.title,
          slug: finalSlug,
          subtitle: input.subtitle !== undefined ? input.subtitle : existing.subtitle,
          excerpt: input.excerpt !== undefined ? input.excerpt : existing.excerpt,
          content: input.content !== undefined ? input.content : existing.content,
          readingTimeMinutes:
            input.readingTimeMinutes !== undefined
              ? input.readingTimeMinutes
              : existing.readingTimeMinutes,
          featured: input.featured ?? existing.featured,
          visibility: input.visibility || existing.visibility,
          seoTitle: input.seoTitle !== undefined ? input.seoTitle : existing.seoTitle,
          seoDescription:
            input.seoDescription !== undefined ? input.seoDescription : existing.seoDescription,
          ogImageId: input.ogImageId !== undefined ? input.ogImageId : existing.ogImageId,
          revision: existing.revision + 1,
          updatedAt: new Date(),
        })
        .where(and(eq(articles.id, id), eq(articles.ownerId, ownerId)))
        .returning();

      // 1. Sync Tags
      await tx.delete(articleTags).where(eq(articleTags.articleId, id));
      const allTagIds = await resolveTagIds(tx, ownerId, input.tagIds, input.tagNames);
      if (allTagIds.length > 0) {
        await tx.insert(articleTags).values(
          allTagIds.map((tagId) => ({
            articleId: id,
            tagId,
          }))
        );
      }

      // 2. Sync Projects
      await tx.delete(articleProjects).where(eq(articleProjects.articleId, id));
      if (input.projectIds && input.projectIds.length > 0) {
        await tx.insert(articleProjects).values(
          input.projectIds.map((projectId) => ({
            articleId: id,
            projectId,
          }))
        );
      }

      // 3. Sync Domains
      await tx.delete(articleDomains).where(eq(articleDomains.articleId, id));
      if (input.domainIds && input.domainIds.length > 0) {
        await tx.insert(articleDomains).values(
          input.domainIds.map((domainId) => ({
            articleId: id,
            domainId,
          }))
        );
      }

      // 4. Sync Skills
      await tx.delete(articleSkills).where(eq(articleSkills.articleId, id));
      if (input.skillIds && input.skillIds.length > 0) {
        await tx.insert(articleSkills).values(
          input.skillIds.map((skillId) => ({
            articleId: id,
            skillId,
          }))
        );
      }

      // 5. Sync Technologies
      await tx.delete(articleTechnologies).where(eq(articleTechnologies.articleId, id));
      if (input.technologyIds && input.technologyIds.length > 0) {
        await tx.insert(articleTechnologies).values(
          input.technologyIds.map((technologyId) => ({
            articleId: id,
            technologyId,
          }))
        );
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ARTICLE_UPDATE',
        entityType: 'article',
        entityId: id,
        oldValues: existing,
        newValues: updatedArticle,
      });

      return await ArticlesService.getArticleEditorById(ownerId, id, tx);
    });
  }

  /**
   * Soft-archives an article (Owner scoped).
   */
  static async archiveArticle(ownerId: string, id: string, actorId?: string): Promise<void> {
    const existing = await db.query.articles.findFirst({
      where: and(eq(articles.id, id), eq(articles.ownerId, ownerId)),
    });

    if (!existing) {
      throw new NotFoundError('Article', id);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(articles)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(articles.id, id), eq(articles.ownerId, ownerId)));

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: 'ARTICLE_ARCHIVE',
        entityType: 'article',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  /**
   * Hard/soft delete maintenance method for backwards compatibility.
   */
  static async deleteArticle(
    ownerId: string,
    id: string,
    actorId?: string,
    permanent = false
  ) {
    const existing = await db.query.articles.findFirst({
      where: and(eq(articles.id, id), eq(articles.ownerId, ownerId)),
    });

    if (!existing) throw new NotFoundError('Article', id);

    return await db.transaction(async (tx) => {
      if (permanent) {
        await tx.delete(articleTags).where(eq(articleTags.articleId, id));
        await tx.delete(articleProjects).where(eq(articleProjects.articleId, id));
        await tx.delete(articleDomains).where(eq(articleDomains.articleId, id));
        await tx.delete(articleSkills).where(eq(articleSkills.articleId, id));
        await tx.delete(articleTechnologies).where(eq(articleTechnologies.articleId, id));
        await tx.delete(articles).where(and(eq(articles.id, id), eq(articles.ownerId, ownerId)));
      } else {
        await tx
          .update(articles)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(and(eq(articles.id, id), eq(articles.ownerId, ownerId)));
      }

      await AuditService.record(tx, {
        actorId: actorId || ownerId,
        action: permanent ? 'ARTICLE_DELETE_PERMANENT' : 'ARTICLE_DELETE',
        entityType: 'article',
        entityId: id,
        oldValues: existing,
      });

      return existing;
    });
  }
}

export const ArticleService = ArticlesService;
