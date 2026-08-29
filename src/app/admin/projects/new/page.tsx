import { requireOwnerSession } from '@/lib/auth';
import { TaxonomyService } from '@/services/taxonomy.service';
import { ProjectForm } from '../ProjectForm';

export default async function NewProjectPage() {
  const session = await requireOwnerSession('/admin/projects/new');
  const [technologies, skills] = await Promise.all([
    TaxonomyService.getTechnologies(session.userId),
    TaxonomyService.getSkills(session.userId),
  ]);

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
        technologies={technologies}
        skills={skills}
      />
    </div>
  );
}
