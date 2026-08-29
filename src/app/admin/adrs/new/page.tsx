import { requireOwnerSession } from '@/lib/auth';
import { ProjectsService } from '@/services/projects.service';
import { ADRService } from '@/services/adrs.service';
import { ADRForm } from '../ADRForm';

export default async function NewADRPage() {
  const session = await requireOwnerSession();

  const [projectsList, adrsResult] = await Promise.all([
    ProjectsService.getProjectsSelector(session.userId),
    ADRService.getAdminADRs(session.userId, { page: 1, pageSize: 100 }),
  ]);

  const adrsSelector = adrsResult.data.map((a: any) => ({
    id: a.id,
    name: `ADR-${String(a.number || 0).padStart(3, '0')}: ${a.title}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Record Architectural Decision
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Document problem context, evaluate alternatives, and record consequences.
        </p>
      </div>

      <ADRForm
        mode="create"
        availableProjects={projectsList}
        availableADRs={adrsSelector}
      />
    </div>
  );
}
