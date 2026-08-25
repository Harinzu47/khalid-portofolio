import { TechnologyForm } from '../TechnologyForm';

export default function NewTechnologyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Register Technology
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Add new programming languages, frameworks, cloud services, and tools to the taxonomy.
        </p>
      </div>

      <TechnologyForm mode="create" />
    </div>
  );
}
