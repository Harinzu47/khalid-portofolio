import { TaxonomyService } from '@/services/taxonomy.service';
import { TechnologyForm } from '../../TechnologyForm';
import { notFound } from 'next/navigation';

export default async function EditTechnologyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let tech;
  try {
    tech = await TaxonomyService.getTechnologyById(id);
  } catch {
    notFound();
  }

  const initialData = {
    name: tech.name,
    slug: tech.slug,
    category: tech.category,
    description: tech.description,
    websiteUrl: tech.websiteUrl,
    iconName: tech.iconName,
    visibility: (tech.visibility || 'public') as any,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Technology
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update technology classification and documentation URLs.
        </p>
      </div>

      <TechnologyForm mode="edit" technologyId={id} initialData={initialData} />
    </div>
  );
}
