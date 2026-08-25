import { RoadmapService } from '@/services/roadmap.service';
import { LearningGoalForm } from '../../LearningGoalForm';
import { notFound } from 'next/navigation';

export default async function EditLearningGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let goal;
  try {
    goal = await RoadmapService.getLearningGoalById(id);
  } catch {
    notFound();
  }

  const initialData = {
    title: goal.title,
    description: goal.description,
    status: goal.status as 'planned' | 'in_progress' | 'completed' | 'abandoned',
    priority: goal.priority as 'low' | 'medium' | 'high' | 'urgent',
    progress: goal.progress,
    targetDate: goal.targetDate,
    startedAt: goal.startedAt,
    completedAt: goal.completedAt,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Learning Goal
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update progress percentage, syllabus milestones, and completion status.
        </p>
      </div>

      <LearningGoalForm mode="edit" goalId={id} initialData={initialData} />
    </div>
  );
}
