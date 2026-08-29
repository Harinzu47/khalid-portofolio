import Link from 'next/link';
import { requireOwnerSession } from '@/lib/auth';
import { ArticlesService } from '@/services/articles.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { ArchiveArticleButton } from './ArchiveArticleButton';
import { Plus, Edit, ExternalLink, FileText } from 'lucide-react';

export default async function AdminArticlesPage() {
  const session = await requireOwnerSession();
  const result = await ArticlesService.getAdminArticles(session.userId, { page: 1, pageSize: 50 });
  const articlesList = result.data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <FileText className="w-5 h-5 text-terminal-secondary" />
            <span>Articles Management</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Manage long-form engineering essays, architectural deep-dives, and technical tutorials.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Articles Data Table */}
      {articlesList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No articles found in the database.</p>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Write your first technical deep-dive</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Publication</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articlesList.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary flex items-center space-x-2">
                      <span>{article.title}</span>
                      {article.isFeatured && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-terminal-secondary/15 text-terminal-secondary border border-terminal-secondary/30">
                          featured
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-terminal-text-muted truncate max-w-xs">
                      {article.slug}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      article.publicationStatus === 'published'
                        ? 'primary'
                        : article.publicationStatus === 'review'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {article.publicationStatus}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="text-[11px] text-terminal-text-muted font-mono uppercase">
                    {article.visibility}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {(article.tags || []).slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-muted"
                      >
                        #{t.name}
                      </span>
                    ))}
                    {(article.tags || []).length > 3 && (
                      <span className="text-[10px] text-terminal-text-muted">
                        +{(article.tags || []).length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-terminal-text-muted text-[11px]">
                  {new Date(article.updatedAt).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {article.publishedAt && (
                      <Link
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-alt transition-colors"
                        title="View Public Article"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Article"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <ArchiveArticleButton
                      articleId={article.id}
                      articleTitle={article.title}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
