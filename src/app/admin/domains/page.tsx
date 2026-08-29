import Link from 'next/link';
import { TaxonomyService } from '@/services/taxonomy.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { DeleteDomainButton } from './DeleteDomainButton';
import { Plus, Edit, Layers } from 'lucide-react';

export default async function AdminDomainsPage() {
  const domainsList = await TaxonomyService.getDomains();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <Layers className="w-5 h-5 text-terminal-secondary" />
            <span>Knowledge Domains</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Manage high-level engineering domains and knowledge taxonomy clusters.
          </p>
        </div>

        <Link
          href="/admin/domains/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Domain</span>
        </Link>
      </div>

      {/* Domains Data Table */}
      {domainsList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No engineering domains configured in the taxonomy.</p>
          <Link
            href="/admin/domains/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Register a new knowledge domain</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domainsList.map((domain) => (
              <TableRow key={domain.id}>
                <TableCell>
                  <div className="font-semibold text-terminal-text-primary">
                    {domain.name}
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-xs font-mono text-terminal-text-muted">
                    {domain.slug}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-terminal-text-secondary line-clamp-1">
                    {domain.description || '—'}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link
                      href={`/admin/domains/${domain.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Domain"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteDomainButton
                      domainId={domain.id}
                      domainName={domain.name}
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
