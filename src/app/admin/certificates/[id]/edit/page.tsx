import { CertificatesService } from '@/services/certificates.service';
import { CertificateForm } from '../../CertificateForm';
import { notFound } from 'next/navigation';

export default async function EditCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let cert;
  try {
    cert = await CertificatesService.getAdminCertificateById(id);
  } catch {
    notFound();
  }

  const initialData = {
    name: cert.name,
    issuer: cert.issuer,
    issuedAt: cert.issuedAt,
    expiresAt: cert.expiresAt,
    credentialId: cert.credentialId,
    credentialUrl: cert.credentialUrl,
    certificateMediaId: cert.certificateMediaId,
    description: cert.description,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold font-mono text-terminal-text-primary">
          Edit Certificate
        </h1>
        <p className="text-xs font-mono text-terminal-text-secondary">
          Update credential verification details and syllabus coverage.
        </p>
      </div>

      <CertificateForm mode="edit" certificateId={id} initialData={initialData} />
    </div>
  );
}
