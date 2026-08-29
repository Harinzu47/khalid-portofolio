import { DomainForm } from '../DomainForm';

export default function NewDomainPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Register Knowledge Domain
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Define a high-level architectural knowledge domain.
        </p>
      </div>

      <DomainForm mode="create" />
    </div>
  );
}
