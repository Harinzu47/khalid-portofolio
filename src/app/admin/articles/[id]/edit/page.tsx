import { ArticlesService } from '@/services/articles.service';
import { ArticleForm } from '../../ArticleForm';
import { notFound } from 'next/navigation';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let article;
  try {
    article = await ArticlesService.getAdminArticleById(id);
  } catch {
    notFound();
  }

  const availableProjects = await ArticlesService.getAvailableProjects();

  const initialData = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    status: article.status as 'draft' | 'review' | 'published' | 'archived',
    featured: article.featured,
    published: article.publishedAt !== null,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    tagNames: article.tags.map((at) => at.tag.name),
    projectIds: article.projects.map((ap) => ap.projectId),
  };

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

      <ArticleForm
        mode="edit"
        articleId={id}
        initialData={initialData}
        availableProjects={availableProjects}
      />
    </div>
  );
}
