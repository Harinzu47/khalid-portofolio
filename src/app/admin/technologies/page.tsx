import Link from 'next/link';
import { TaxonomyService } from '@/services/taxonomy.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { DeleteTechnologyButton } from './DeleteTechnologyButton';
import { Plus, Edit, ExternalLink, Wrench } from 'lucide-react';

export default async function AdminTechnologiesPage() {
  const techList = await TaxonomyService.getTechnologies();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-terminal-primary" />
            <span>Technologies & Tools</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Manage tech stack components, tools, platforms, and official documentation links.
          </p>
        </div>

        <Link
          href="/admin/technologies/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Technology</span>
        </Link>
      </div>

      {/* Tech Data Table */}
      {techList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No technologies configured in the taxonomy.</p>
          <Link
            href="/admin/technologies/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Register your technical stack tools</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Technology</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {techList.map((tech) => (
              <TableRow key={tech.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary">
                      {tech.name}
                    </div>
                    <div className="text-[11px] text-terminal-text-muted">
                      {tech.slug}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">{tech.category || 'General'}</Badge>
                </TableCell>

                <TableCell className="font-mono text-xs text-terminal-text-muted">
                  {tech.websiteUrl ? (
                    <a
                      href={tech.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
                    >
                      <span className="truncate max-w-xs">{tech.websiteUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link
                      href={`/admin/technologies/${tech.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Technology"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteTechnologyButton
                      technologyId={tech.id}
                      technologyName={tech.name}
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
