import { TaxonomyService } from '@/services/taxonomy.service';
import { DomainForm } from '../../DomainForm';
import { notFound } from 'next/navigation';

export default async function EditDomainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let domain;
  try {
    domain = await TaxonomyService.getDomainById(id);
  } catch {
    notFound();
  }

  const initialData = {
    name: domain.name,
    slug: domain.slug,
    description: domain.description,
    sortOrder: domain.sortOrder,
    visibility: domain.visibility,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Knowledge Domain
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update knowledge domain boundary definition and hierarchy.
        </p>
      </div>

      <DomainForm mode="edit" domainId={id} initialData={initialData} />
    </div>
  );
}
