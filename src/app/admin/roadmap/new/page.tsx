import { requireOwnerSession } from '@/lib/auth';
import { RoadmapForm } from '../RoadmapForm';

export const dynamic = 'force-dynamic';

export default async function NewRoadmapItemPage() {
  await requireOwnerSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Create Roadmap Milestone</h1>
        <p className="text-xs text-slate-400 mt-1">
          Track future architectures, deployments, and systems engineering objectives.
        </p>
      </div>

      <RoadmapForm />
    </div>
  );
}
