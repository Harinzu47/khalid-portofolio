import { requireOwnerSession } from '@/lib/auth';
import { LearningPathService } from '@/services/learning-path.service';
import { TaxonomyService } from '@/services/taxonomy.service';
import { LearningPathForm } from '../../LearningPathForm';

export const dynamic = 'force-dynamic';

export default async function EditLearningPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwnerSession();
  const { id } = await params;

  const [path, skills, domains, technologies] = await Promise.all([
    LearningPathService.getLearningPathEditorById(session.userId, id),
    TaxonomyService.getSkillsSelector(session.userId),
    TaxonomyService.getDomainsSelector(session.userId),
    TaxonomyService.getTechnologiesSelector(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Edit Learning Path</h1>
        <p className="text-xs text-slate-400 mt-1">
          Update your curriculum modules, active focus, or taxonomy mappings.
        </p>
      </div>

      <LearningPathForm
        initialData={path}
        skillOptions={skills}
        domainOptions={domains}
        technologyOptions={technologies}
      />
    </div>
  );
}
