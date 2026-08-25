import { SkillForm } from '../SkillForm';

export default function NewSkillPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Register Skill
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Define core capabilities, system design competencies, and expertise ratings.
        </p>
      </div>

      <SkillForm mode="create" />
    </div>
  );
}
