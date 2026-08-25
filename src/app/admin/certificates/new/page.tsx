import { CertificateForm } from '../CertificateForm';

export default function NewCertificatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Register Certification
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Record verified industry credentials, IDs, and official verification links.
        </p>
      </div>

      <CertificateForm mode="create" />
    </div>
  );
}
