import { requireOwnerSession } from '@/lib/auth';
import { NowEntryForm } from '../NowEntryForm';
import { ProjectsService } from '@/services/projects.service';
import { TaxonomyService } from '@/services/taxonomy.service';
import { LearningPathService } from '@/services/learning-path.service';
import { RoadmapService } from '@/services/roadmap.service';

export const dynamic = 'force-dynamic';

export default async function NewNowPage() {
  const session = await requireOwnerSession();

  const [projects, learningPaths, roadmaps, domains, technologies] = await Promise.all([
    ProjectsService.getProjectsSelector(session.userId),
    LearningPathService.getLearningPathsSelector(session.userId),
    RoadmapService.getRoadmapItemsSelector(session.userId),
    TaxonomyService.getDomainsSelector(session.userId),
    TaxonomyService.getTechnologiesSelector(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">New Focus Entry</h1>
        <p className="text-xs text-slate-400 mt-1">
          Capture what you are currently working on or add historical engineering activity.
        </p>
      </div>

      <NowEntryForm
        projectOptions={projects}
        learningPathOptions={learningPaths}
        roadmapOptions={roadmaps}
        domainOptions={domains}
        technologyOptions={technologies}
      />
    </div>
  );
}
