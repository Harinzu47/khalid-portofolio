import { requireOwnerSession } from '@/lib/auth';
import { RoadmapService } from '@/services/roadmap.service';
import { RoadmapForm } from '../../RoadmapForm';

export const dynamic = 'force-dynamic';

export default async function EditRoadmapItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwnerSession();
  const { id } = await params;

  const item = await RoadmapService.getRoadmapEditorById(session.userId, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Edit Roadmap Milestone</h1>
        <p className="text-xs text-slate-400 mt-1">
          Update status, milestone deliverables, and target completion dates.
        </p>
      </div>

      <RoadmapForm initialData={item} />
    </div>
  );
}
