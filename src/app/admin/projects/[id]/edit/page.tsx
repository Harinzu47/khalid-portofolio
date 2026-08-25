import { ProjectsService } from '@/services/projects.service';
import { ProjectForm } from '../../ProjectForm';
import { notFound } from 'next/navigation';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project;
  try {
    project = await ProjectsService.getAdminProjectById(id);
  } catch {
    notFound();
  }

  const taxonomy = await ProjectsService.getTaxonomyOptions();

  const initialData = {
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    description: project.description,
    problemStatement: project.problemStatement,
    solution: project.solution,
    architecture: project.architecture,
    role: project.role,
    status: project.status as 'idea' | 'planning' | 'active' | 'completed' | 'archived',
    startDate: project.startDate,
    endDate: project.endDate,
    repositoryUrl: project.repositoryUrl,
    liveUrl: project.liveUrl,
    featured: project.featured,
    published: project.publishedAt !== null,
    technologyIds: project.technologies.map((pt) => pt.technologyId),
    skillIds: project.skills.map((ps) => ps.skillId),
    links: project.links.map((l) => ({
      label: l.label,
      url: l.url,
      linkType: l.linkType || 'external',
    })),
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

      <ProjectForm
        mode="edit"
        projectId={id}
        initialData={initialData}
        technologies={taxonomy.technologies}
        skills={taxonomy.skills}
      />
    </div>
  );
}
