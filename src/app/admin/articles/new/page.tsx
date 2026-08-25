import { ArticlesService } from '@/services/articles.service';
import { ArticleForm } from '../ArticleForm';

export default async function NewArticlePage() {
  const availableProjects = await ArticlesService.getAvailableProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Write Technical Article
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Publish deep-dives, benchmark reports, and software engineering methodologies.
        </p>
      </div>

      <ArticleForm mode="create" availableProjects={availableProjects} />
    </div>
  );
}
