import Link from 'next/link';
import { RoadmapService } from '@/services/roadmap.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { DeleteRoadmapButton } from './DeleteRoadmapButton';
import { Plus, Edit, Target, Calendar } from 'lucide-react';

export default async function AdminRoadmapPage() {
  const roadmapItems = await RoadmapService.getRoadmapItems();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <Target className="w-5 h-5 text-terminal-primary" />
            <span>Roadmap & Milestones</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Manage engineering architecture roadmap, infrastructure tracks, and system development goals.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <Link
            href="/admin/learning-goals"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded border border-terminal-border bg-terminal-surface text-terminal-text-primary font-mono text-xs hover:border-terminal-text-muted transition-colors"
          >
            <span>Learning Goals</span>
          </Link>
          <Link
            href="/admin/roadmap/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Milestone</span>
          </Link>
        </div>
      </div>

      {/* Roadmap Data Table */}
      {roadmapItems.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No roadmap milestones registered.</p>
          <Link
            href="/admin/roadmap/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Add your first engineering milestone</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Milestone</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Target Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roadmapItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-[11px] text-terminal-text-muted truncate max-w-sm">
                        {item.description}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">{item.category || 'General'}</Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      item.status === 'completed'
                        ? 'primary'
                        : item.status === 'in_progress'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>

                <TableCell className="font-mono text-xs text-terminal-text-muted whitespace-nowrap">
                  {item.targetDate ? (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-terminal-secondary" />
                      <span>{item.targetDate}</span>
                    </div>
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link
                      href={`/admin/roadmap/${item.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Milestone"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteRoadmapButton
                      itemId={item.id}
                      itemTitle={item.title}
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
