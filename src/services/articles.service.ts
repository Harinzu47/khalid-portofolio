import { db } from '@/db/client';
import {
  articles,
  tags,
  articleTags,
  articleProjects,
  projects,
} from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { slugify } from '@/lib/slug';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from './audit.service';
import { getPaginationOffset, formatPaginatedResult, PaginationParams } from '@/lib/pagination';
import type { ArticleFormInput } from '@/validations/article';

export class ArticlesService {
  /**
   * Fetches public articles for the technical publications feed.
   */
  static async getPublicArticles(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 10);

    const conditions = and(
      eq(articles.status, 'published'),
      sql`${articles.publishedAt} IS NOT NULL`,
      isNull(articles.deletedAt)
    );

    const [data, countResult] = await Promise.all([
      db.query.articles.findMany({
        where: conditions,
        orderBy: [desc(articles.publishedAt), desc(articles.createdAt)],
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
   * Fetches a single public article by slug with joined tags and linked projects.
   */
  static async getPublicArticleBySlug(slug: string) {
    const article = await db.query.articles.findFirst({
      where: and(
        eq(articles.slug, slug),
        eq(articles.status, 'published'),
        sql`${articles.publishedAt} IS NOT NULL`,
        isNull(articles.deletedAt)
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
        ogImage: true,
      },
    });

    if (!article) {
      throw new NotFoundError('Article', slug);
    }

    return article;
  }

  /**
   * Fetches all articles for the admin dashboard management table.
   */
  static async getAdminArticles(params?: PaginationParams) {
    const { page, pageSize, offset, limit } = getPaginationOffset(params, 20);

    const conditions = isNull(articles.deletedAt);

    const [data, countResult] = await Promise.all([
      db.query.articles.findMany({
        where: conditions,
        orderBy: [desc(articles.updatedAt)],
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
   * Fetches an article by ID for editing in admin.
   */
  static async getAdminArticleById(id: string) {
    const article = await db.query.articles.findFirst({
      where: and(eq(articles.id, id), isNull(articles.deletedAt)),
      with: {
        tags: {
          with: {
            tag: true,
          },
        },
        projects: true,
      },
    });

    if (!article) {
      throw new NotFoundError('Article', id);
    }

    return article;
  }

  /**
   * Creates a new article and resolves/links its tags and projects atomically.
   */
  static async createArticle(input: ArticleFormInput, actorId?: string) {
    const finalSlug = input.slug?.trim() || slugify(input.title);

    // Check slug uniqueness
    const existing = await db.query.articles.findFirst({
      where: eq(articles.slug, finalSlug),
    });

    if (existing) {
      throw new ConflictError(`An article with slug "${finalSlug}" already exists.`);
    }

    return await db.transaction(async (tx) => {
      const publishedAt = input.published ? new Date() : null;

      const [newArticle] = await tx
        .insert(articles)
        .values({
          title: input.title,
          slug: finalSlug,
          excerpt: input.excerpt || null,
          content: input.content,
          status: input.status,
          featured: input.featured,
          publishedAt,
          seoTitle: input.seoTitle || null,
          seoDescription: input.seoDescription || null,
        })
        .returning();

      // Resolve and link tags
      if (input.tagNames.length > 0) {
        for (const rawTagName of input.tagNames) {
          const cleanName = rawTagName.trim();
          if (!cleanName) continue;
          const tagSlug = slugify(cleanName);

          let tag = await tx.query.tags.findFirst({
            where: eq(tags.slug, tagSlug),
          });

          if (!tag) {
            const [createdTag] = await tx
              .insert(tags)
              .values({ name: cleanName, slug: tagSlug })
              .returning();
            tag = createdTag;
          }

          await tx
            .insert(articleTags)
            .values({ articleId: newArticle.id, tagId: tag.id })
            .onConflictDoNothing();
        }
      }

      // Link projects
      if (input.projectIds.length > 0) {
        await tx.insert(articleProjects).values(
          input.projectIds.map((projectId) => ({
            articleId: newArticle.id,
            projectId,
          }))
        );
      }

      // Record Audit Log
      await AuditService.record(tx, {
        actorId,
        action: 'ARTICLE_CREATE',
        entityType: 'article',
        entityId: newArticle.id,
        newValues: newArticle,
      });

      return newArticle;
    });
  }

  /**
   * Updates an existing article and its linked tags/projects atomically.
   */
  static async updateArticle(id: string, input: ArticleFormInput, actorId?: string) {
    const existing = await db.query.articles.findFirst({
      where: and(eq(articles.id, id), isNull(articles.deletedAt)),
    });

    if (!existing) {
      throw new NotFoundError('Article', id);
    }

    const finalSlug = input.slug?.trim() || slugify(input.title);

    if (finalSlug !== existing.slug) {
      const duplicate = await db.query.articles.findFirst({
        where: and(eq(articles.slug, finalSlug), sql`${articles.id} != ${id}`),
      });
      if (duplicate) {
        throw new ConflictError(`Slug "${finalSlug}" is already taken by another article.`);
      }
    }

    return await db.transaction(async (tx) => {
      const publishedAt = input.published
        ? existing.publishedAt || new Date()
        : null;

      const [updatedArticle] = await tx
        .update(articles)
        .set({
          title: input.title,
          slug: finalSlug,
          excerpt: input.excerpt || null,
          content: input.content,
          status: input.status,
          featured: input.featured,
          publishedAt,
          seoTitle: input.seoTitle || null,
          seoDescription: input.seoDescription || null,
          updatedAt: new Date(),
        })
        .where(eq(articles.id, id))
        .returning();

      // Reset and sync tags
      await tx.delete(articleTags).where(eq(articleTags.articleId, id));
      if (input.tagNames.length > 0) {
        for (const rawTagName of input.tagNames) {
          const cleanName = rawTagName.trim();
          if (!cleanName) continue;
          const tagSlug = slugify(cleanName);

          let tag = await tx.query.tags.findFirst({
            where: eq(tags.slug, tagSlug),
          });

          if (!tag) {
            const [createdTag] = await tx
              .insert(tags)
              .values({ name: cleanName, slug: tagSlug })
              .returning();
            tag = createdTag;
          }

          await tx
            .insert(articleTags)
            .values({ articleId: id, tagId: tag.id })
            .onConflictDoNothing();
        }
      }

      // Reset and sync linked projects
      await tx.delete(articleProjects).where(eq(articleProjects.articleId, id));
      if (input.projectIds.length > 0) {
        await tx.insert(articleProjects).values(
          input.projectIds.map((projectId) => ({
            articleId: id,
            projectId,
          }))
        );
      }

      // Record Audit Log
      await AuditService.record(tx, {
        actorId,
        action: 'ARTICLE_UPDATE',
        entityType: 'article',
        entityId: id,
        oldValues: existing,
        newValues: updatedArticle,
      });

      return updatedArticle;
    });
  }

  /**
   * Soft deletes or permanently deletes an article.
   */
  static async deleteArticle(id: string, actorId?: string, permanent = false) {
    const existing = await db.query.articles.findFirst({
      where: eq(articles.id, id),
    });

    if (!existing) {
      throw new NotFoundError('Article', id);
    }

    return await db.transaction(async (tx) => {
      if (permanent) {
        await tx.delete(articles).where(eq(articles.id, id));
      } else {
        await tx
          .update(articles)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(eq(articles.id, id));
      }

      await AuditService.record(tx, {
        actorId,
        action: permanent ? 'ARTICLE_PERMANENT_DELETE' : 'ARTICLE_SOFT_DELETE',
        entityType: 'article',
        entityId: id,
        oldValues: existing,
      });
    });
  }

  /**
   * Fetches available projects for linking to articles.
   */
  static async getAvailableProjects() {
    return await db
      .select({ id: projects.id, title: projects.title })
      .from(projects)
      .where(isNull(projects.deletedAt))
      .orderBy(projects.title);
  }
}
