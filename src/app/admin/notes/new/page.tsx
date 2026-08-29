import { requireOwnerSession } from '@/lib/auth';
import { ProjectsService } from '@/services/projects.service';
import { TaxonomyService } from '@/services/taxonomy.service';
import { NoteForm } from '../NoteForm';

export default async function NewNotePage() {
  const session = await requireOwnerSession();

  const [projectsList, domainsList, skillsList, techList, tagsList] = await Promise.all([
    ProjectsService.getProjectsSelector(session.userId),
    TaxonomyService.getDomainsSelector(session.userId),
    TaxonomyService.getSkillsSelector(session.userId),
    TaxonomyService.getTechnologiesSelector(session.userId),
    TaxonomyService.getTagsSelector(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Create Tech Note
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Record verified code snippets, cheatsheets, and implementation recipes.
        </p>
      </div>

      <NoteForm
        mode="create"
        availableProjects={projectsList}
        availableDomains={domainsList}
        availableSkills={skillsList}
        availableTechnologies={techList}
        availableTags={tagsList}
      />
    </div>
  );
}
