import Link from 'next/link';
import { LegacyLearningGoalsService } from '@/services/legacy-learning-goals.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { DeleteLearningGoalButton } from './DeleteLearningGoalButton';
import { Plus, Edit, BookOpen } from 'lucide-react';

export default async function AdminLearningGoalsPage() {
  const goals = await LegacyLearningGoalsService.getLearningGoals();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-terminal-secondary" />
            <span>Learning Objectives & Tracks</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Continuous engineering education, systems deep-dives, and capability milestones.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <Link
            href="/admin/roadmap"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded border border-terminal-border bg-terminal-surface text-terminal-text-primary font-mono text-xs hover:border-terminal-text-muted transition-colors"
          >
            <span>Roadmap Board</span>
          </Link>
          <Link
            href="/admin/learning-goals/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </Link>
        </div>
      </div>

      {/* Learning Goals Data Table */}
      {goals.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No learning goals recorded.</p>
          <Link
            href="/admin/learning-goals/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Add a learning objective</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Goal Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal) => (
              <TableRow key={goal.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary">
                      {goal.title}
                    </div>
                    {goal.description && (
                      <div className="text-[11px] text-terminal-text-muted truncate max-w-sm">
                        {goal.description}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      goal.priority === 'urgent'
                        ? 'warning'
                        : goal.priority === 'high'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {goal.priority}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="w-28 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-terminal-text-muted">
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-terminal-bg rounded-full overflow-hidden border border-terminal-border">
                      <div
                        className="h-full bg-terminal-primary rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      goal.status === 'completed'
                        ? 'primary'
                        : goal.status === 'in_progress'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {goal.status}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link
                      href={`/admin/learning-goals/${goal.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Goal"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteLearningGoalButton
                      goalId={goal.id}
                      goalTitle={goal.title}
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
