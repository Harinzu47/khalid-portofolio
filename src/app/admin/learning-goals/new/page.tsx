import { LearningGoalForm } from '../LearningGoalForm';

export default function NewLearningGoalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Create Learning Goal
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Track technical learning trajectories, research tracks, and skill mastery.
        </p>
      </div>

      <LearningGoalForm mode="create" />
    </div>
  );
}
