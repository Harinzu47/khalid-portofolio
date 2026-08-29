import { requireOwnerSession } from '@/lib/auth';
import { ArticlesService } from '@/services/articles.service';
import { ProjectsService } from '@/services/projects.service';
import { TaxonomyService } from '@/services/taxonomy.service';
import { ArticleForm } from '../../ArticleForm';
import { EntityConnectionsPanel } from '@/components/admin/relationships/EntityConnectionsPanel';
import { PublicationPanel } from '@/components/admin/publishing/PublicationPanel';
import { notFound } from 'next/navigation';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwnerSession();
  const { id } = await params;

  let article;
  try {
    article = await ArticlesService.getArticleEditorById(session.userId, id);
  } catch {
    notFound();
  }

  const [projectsList, domainsList, skillsList, techList, tagsList] = await Promise.all([
    ProjectsService.getProjectsSelector(session.userId),
    TaxonomyService.getDomainsSelector(session.userId),
    TaxonomyService.getSkillsSelector(session.userId),
    TaxonomyService.getTechnologiesSelector(session.userId),
    TaxonomyService.getTagsSelector(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Article
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update content, tags, linked case studies, and SEO configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ArticleForm
            mode="edit"
            articleId={id}
            initialData={article}
            availableProjects={projectsList}
            availableDomains={domainsList}
            availableSkills={skillsList}
            availableTechnologies={techList}
            availableTags={tagsList}
          />
        </div>

        <div className="space-y-6">
          {/* Editorial Lifecycle & Publishing Control */}
          <PublicationPanel
            entityType="ARTICLE"
            entityId={id}
            entityTitle={article.title}
            initialVisibility={(article.visibility || 'private') as any}
            initialPublicationStatus={(article.publicationStatus || 'draft') as any}
            initialPublishedAt={article.publishedAt ? new Date(article.publishedAt).toISOString() : null}
            initialScheduledPublishAt={article.scheduledPublishAt ? new Date(article.scheduledPublishAt).toISOString() : null}
            initialArchivedAt={article.archivedAt ? new Date(article.archivedAt).toISOString() : null}
          />

          {/* Semantic Knowledge Graph Connections */}
          <EntityConnectionsPanel
            entityType="ARTICLE"
            entityId={id}
            entityTitle={article.title}
          />
        </div>
      </div>
    </div>
  );
}
