import { requireOwnerSession } from '@/lib/auth';
import { ProjectsService } from '@/services/projects.service';
import { TaxonomyService } from '@/services/taxonomy.service';
import { ArticleForm } from '../ArticleForm';

export default async function NewArticlePage() {
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
          Write Technical Article
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Publish deep-dives, benchmark reports, and software engineering methodologies.
        </p>
      </div>

      <ArticleForm
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
