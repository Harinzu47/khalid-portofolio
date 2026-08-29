import { requireOwnerSession } from '@/lib/auth';
import { ProjectsService } from '@/services/projects.service';
import { TaxonomyService } from '@/services/taxonomy.service';
import { ProjectForm } from '../../ProjectForm';
import { EntityConnectionsPanel } from '@/components/admin/relationships/EntityConnectionsPanel';
import { PublicationPanel } from '@/components/admin/publishing/PublicationPanel';
import { notFound } from 'next/navigation';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireOwnerSession(`/admin/projects/${id}/edit`);

  let project;
  try {
    project = await ProjectsService.getProjectEditorById(session.userId, id);
  } catch {
    notFound();
  }

  const [technologies, skills] = await Promise.all([
    TaxonomyService.getTechnologies(session.userId),
    TaxonomyService.getSkills(session.userId),
  ]);

  const initialData = {
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    description: project.description,
    problemStatement: project.problemStatement,
    solution: project.solution,
    architecture: project.architecture,
    role: project.role,
    status: project.status as any,
    startDate: project.startDate,
    endDate: project.endDate,
    repositoryUrl: project.repositoryUrl,
    liveUrl: project.liveUrl,
    featured: project.featured,
    published: project.publicationStatus === 'published',
    technologyIds: project.technologies.map((pt) => pt.id),
    skillIds: project.skills.map((ps) => ps.id),
    links: [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Case Study
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update specs, architectural diagrams, metrics, or linked taxonomy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <ProjectForm
            mode="edit"
            projectId={id}
            initialData={initialData}
            technologies={technologies}
            skills={skills}
          />
        </div>

        <div className="space-y-6">
          {/* Editorial Lifecycle & Publishing Control */}
          <PublicationPanel
            entityType="PROJECT"
            entityId={id}
            entityTitle={project.title}
            initialVisibility={(project.visibility || 'private') as any}
            initialPublicationStatus={(project.publicationStatus || 'draft') as any}
            initialPublishedAt={project.publishedAt ? new Date(project.publishedAt).toISOString() : null}
            initialScheduledPublishAt={project.scheduledPublishAt ? new Date(project.scheduledPublishAt).toISOString() : null}
            initialArchivedAt={project.archivedAt ? new Date(project.archivedAt).toISOString() : null}
          />

          {/* Semantic Knowledge Graph Connections */}
          <EntityConnectionsPanel
            entityType="PROJECT"
            entityId={id}
            entityTitle={project.title}
          />
        </div>
      </div>
    </div>
  );
}
