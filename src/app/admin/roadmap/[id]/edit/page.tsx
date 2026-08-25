import { RoadmapService } from '@/services/roadmap.service';
import { RoadmapForm } from '../../RoadmapForm';
import { notFound } from 'next/navigation';

export default async function EditRoadmapItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let item;
  try {
    item = await RoadmapService.getRoadmapItemById(id);
  } catch {
    notFound();
  }

  const initialData = {
    title: item.title,
    description: item.description,
    category: item.category,
    status: item.status as 'backlog' | 'planned' | 'in_progress' | 'completed',
    priority: item.priority,
    targetDate: item.targetDate,
    sortOrder: item.sortOrder,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Roadmap Milestone
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update status, milestone deliverables, and target completion dates.
        </p>
      </div>

      <RoadmapForm mode="edit" itemId={id} initialData={initialData} />
    </div>
  );
}
