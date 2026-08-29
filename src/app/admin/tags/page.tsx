import { TaxonomyService } from '@/services/taxonomy.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Tag as TagIcon } from 'lucide-react';

export default async function AdminTagsPage() {
  const tagsList = await TaxonomyService.getTags();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <TagIcon className="w-5 h-5 text-terminal-secondary" />
            <span>Taxonomy Tags</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Cross-cutting taxonomy tags applied across projects, articles, and journal notes.
          </p>
        </div>
      </div>

      {/* Tags Data Table */}
      {tagsList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No taxonomy tags found. Tags are automatically registered when applied to content.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tagsList.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  <div className="font-semibold text-terminal-text-primary">
                    #{tag.name}
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-xs font-mono text-terminal-text-muted">
                    {tag.slug}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-terminal-text-secondary">
                    {tag.description || '—'}
                  </span>
                </TableCell>

                <TableCell className="text-terminal-text-muted text-[11px]">
                  {new Date(tag.updatedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
