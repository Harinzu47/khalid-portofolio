import { JournalService } from '@/services/journal.service';
import { JournalForm } from '../JournalForm';

export default async function NewJournalPage() {
  const taxonomy = await JournalService.getTaxonomyOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Create Journal Log
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Record daily engineering decisions, debugging steps, and system maintenance logs.
        </p>
      </div>

      <JournalForm
        mode="create"
        availableProjects={taxonomy.projects}
        availableTechnologies={taxonomy.technologies}
      />
    </div>
  );
}
