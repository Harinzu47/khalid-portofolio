import { TaxonomyService } from '@/services/taxonomy.service';
import { SkillForm } from '../../SkillForm';
import { notFound } from 'next/navigation';

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let skill;
  try {
    skill = await TaxonomyService.getSkillById(id);
  } catch {
    notFound();
  }

  const initialData = {
    name: skill.name,
    slug: skill.slug,
    category: skill.category || undefined,
    description: skill.description,
    proficiencyLevel: skill.proficiencyLevel,
    visibility: (skill.visibility || 'public') as any,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Skill
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update capability specifications and proficiency levels.
        </p>
      </div>

      <SkillForm mode="edit" skillId={id} initialData={initialData} />
    </div>
  );
}
