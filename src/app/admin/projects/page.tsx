import Link from 'next/link';
import { ProjectsService } from '@/services/projects.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { DeleteProjectButton } from './DeleteProjectButton';
import { Plus, Edit, ExternalLink, FolderGit2 } from 'lucide-react';

export default async function AdminProjectsPage() {
  const result = await ProjectsService.getAdminProjects({ page: 1, pageSize: 50 });
  const projectsList = result.data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <FolderGit2 className="w-5 h-5 text-terminal-primary" />
            <span>Projects Management</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Manage portfolio case studies, system architectures, and technical competencies.
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Projects Data Table */}
      {projectsList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No projects found in the database.</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Create your first case study</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Technologies</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectsList.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary flex items-center space-x-2">
                      <span>{project.title}</span>
                      {project.featured && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-terminal-secondary/15 text-terminal-secondary border border-terminal-secondary/30">
                          featured
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-terminal-text-muted truncate max-w-xs">
                      {project.slug}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      project.status === 'completed'
                        ? 'primary'
                        : project.status === 'active'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {project.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  {project.publishedAt ? (
                    <span className="text-[11px] text-terminal-primary font-mono">
                      ● Published
                    </span>
                  ) : (
                    <span className="text-[11px] text-terminal-text-muted font-mono">
                      ○ Draft
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {project.technologies.slice(0, 3).map((pt) => (
                      <span
                        key={pt.technology.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-terminal-surface border border-terminal-border text-terminal-text-muted"
                      >
                        {pt.technology.name}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-[10px] text-terminal-text-muted">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-terminal-text-muted text-[11px]">
                  {project.updatedAt.toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    {project.publishedAt && (
                      <Link
                        href={`/projects/${project.slug}`}
                        target="_blank"
                        className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-text-primary hover:bg-terminal-surface-alt transition-colors"
                        title="View Public Case Study"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteProjectButton
                      projectId={project.id}
                      projectTitle={project.title}
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
