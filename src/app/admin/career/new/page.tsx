import { CareerService } from '@/services/career.service';
import { CareerForm } from '../CareerForm';

export default async function NewCareerPage() {
  const organizations = await CareerService.getOrganizations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Record Career Experience
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Add professional engineering roles, leadership responsibilities, and verified organizations.
        </p>
      </div>

      <CareerForm mode="create" organizations={organizations} />
    </div>
  );
}
