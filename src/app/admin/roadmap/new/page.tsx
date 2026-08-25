import { RoadmapForm } from '../RoadmapForm';

export default function NewRoadmapItemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Create Roadmap Milestone
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Track future architectures, deployments, and systems engineering objectives.
        </p>
      </div>

      <RoadmapForm mode="create" />
    </div>
  );
}
