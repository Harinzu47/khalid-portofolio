import type { Metadata } from 'next';
import { CertificatesService } from '@/services/certificates.service';
import { Award, CheckCircle2, ExternalLink, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Certifications & Verified Credentials | Khalid',
  description:
    'Verified professional engineering certifications in Networking, Cloud Infrastructure, and Systems Architecture.',
};

export const dynamic = 'force-dynamic';

type CertItem = Awaited<ReturnType<typeof CertificatesService.getPublicCertificates>>[number];

export default async function CertificatesPage() {
  let certificatesList: CertItem[] = [];
  try {
    certificatesList = await CertificatesService.getPublicCertificates();
  } catch (err) {
    console.error('Failed to load public certificates:', err);
  }

  return (
    <main className="min-h-screen bg-terminal-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-terminal-warning font-mono text-xs">
            <Award className="w-4 h-4" />
            <span>credentials.verified</span>
          </div>
          <h1 className="text-3xl font-bold font-mono text-terminal-text-primary tracking-tight">
            Certifications & Credentials
          </h1>
          <p className="text-sm font-mono text-terminal-text-secondary leading-relaxed max-w-2xl">
            Industry credentials and validated competencies across networking, cloud infrastructure, and distributed systems.
          </p>
        </div>

        {/* Certificates Grid */}
        {certificatesList.length === 0 ? (
          <div className="p-12 text-center rounded-lg border border-terminal-border bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-2">
            <p>No public certificates registered yet.</p>
            <p className="text-[11px]">Check back soon for verified engineering certifications.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificatesList.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-lg border border-terminal-border bg-terminal-surface hover:border-terminal-warning/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5 text-terminal-primary font-mono text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{cert.issuer}</span>
                      </div>
                      <h2 className="text-base font-bold font-mono text-terminal-text-primary">
                        {cert.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono text-terminal-text-muted">
                    <Calendar className="w-3.5 h-3.5 text-terminal-secondary" />
                    <span>Issued: {cert.issuedAt}</span>
                    {cert.expiresAt && (
                      <>
                        <span>•</span>
                        <span>Expires: {cert.expiresAt}</span>
                      </>
                    )}
                  </div>

                  {cert.credentialId && (
                    <div className="text-xs font-mono text-terminal-text-muted bg-terminal-bg p-2 rounded border border-terminal-border">
                      <span className="text-terminal-text-secondary font-semibold">ID: </span>
                      <span>{cert.credentialId}</span>
                    </div>
                  )}

                  {cert.description && (
                    <p className="text-xs font-mono text-terminal-text-secondary leading-relaxed">
                      {cert.description}
                    </p>
                  )}
                </div>

                {cert.credentialUrl && (
                  <div className="pt-3 border-t border-terminal-border flex justify-end">
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-primary hover:underline"
                    >
                      <span>Verify Credential</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
