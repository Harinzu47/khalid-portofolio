import { NoteForm } from '../NoteForm';

export default function NewNotePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Create Tech Note
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Store reusable CLI commands, configuration snippets, and operational cheatsheets.
        </p>
      </div>

      <NoteForm mode="create" />
    </div>
  );
}
