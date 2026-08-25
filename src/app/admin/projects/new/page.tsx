import { ProjectsService } from '@/services/projects.service';
import { ProjectForm } from '../ProjectForm';

export default async function NewProjectPage() {
  const taxonomy = await ProjectsService.getTaxonomyOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Create Case Study
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Publish a new engineering project, system architecture, or production release.
        </p>
      </div>

      <ProjectForm
        mode="create"
        technologies={taxonomy.technologies}
        skills={taxonomy.skills}
      />
    </div>
  );
}
