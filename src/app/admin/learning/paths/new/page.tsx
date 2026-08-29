import { requireOwnerSession } from '@/lib/auth';
import { TaxonomyService } from '@/services/taxonomy.service';
import { LearningPathForm } from '../LearningPathForm';

export const dynamic = 'force-dynamic';

export default async function NewLearningPathPage() {
  const session = await requireOwnerSession();

  const [skills, domains, technologies] = await Promise.all([
    TaxonomyService.getSkillsSelector(session.userId),
    TaxonomyService.getDomainsSelector(session.userId),
    TaxonomyService.getTechnologiesSelector(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">New Learning Path</h1>
        <p className="text-xs text-slate-400 mt-1">
          Define a structured skill curriculum, roadmap track, or engineering mastery journey.
        </p>
      </div>

      <LearningPathForm
        skillOptions={skills}
        domainOptions={domains}
        technologyOptions={technologies}
      />
    </div>
  );
}
