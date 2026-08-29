import { requireOwnerSession } from '@/lib/auth';
import { NowService } from '@/services/now.service';
import { ProjectsService } from '@/services/projects.service';
import { TaxonomyService } from '@/services/taxonomy.service';
import { LearningPathService } from '@/services/learning-path.service';
import { RoadmapService } from '@/services/roadmap.service';
import { NowEntryForm } from '../../NowEntryForm';

export const dynamic = 'force-dynamic';

export default async function EditNowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwnerSession();
  const { id } = await params;

  const [entry, projects, learningPaths, roadmaps, domains, technologies] = await Promise.all([
    NowService.getNowEntryEditorById(session.userId, id),
    ProjectsService.getProjectsSelector(session.userId),
    LearningPathService.getLearningPathsSelector(session.userId),
    RoadmapService.getRoadmapItemsSelector(session.userId),
    TaxonomyService.getDomainsSelector(session.userId),
    TaxonomyService.getTechnologiesSelector(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Edit Focus Entry</h1>
        <p className="text-xs text-slate-400 mt-1">
          Update your focus details, milestones, or linked relationships.
        </p>
      </div>

      <NowEntryForm
        initialData={entry}
        projectOptions={projects}
        learningPathOptions={learningPaths}
        roadmapOptions={roadmaps}
        domainOptions={domains}
        technologyOptions={technologies}
      />
    </div>
  );
}
