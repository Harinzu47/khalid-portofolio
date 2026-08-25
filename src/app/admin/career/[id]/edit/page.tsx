import { CareerService } from '@/services/career.service';
import { CareerForm } from '../../CareerForm';
import { notFound } from 'next/navigation';

export default async function EditCareerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let exp;
  try {
    exp = await CareerService.getAdminCareerExperienceById(id);
  } catch {
    notFound();
  }

  const organizations = await CareerService.getOrganizations();

  const initialData = {
    organizationId: exp.organizationId,
    position: exp.position,
    employmentType: exp.employmentType || 'Full-time',
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
    isCurrent: exp.isCurrent,
    description: exp.description,
    sortOrder: exp.sortOrder,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Career Role
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update responsibilities, tenure dates, and organizational affiliation.
        </p>
      </div>

      <CareerForm
        mode="edit"
        experienceId={id}
        initialData={initialData}
        organizations={organizations}
      />
    </div>
  );
}
