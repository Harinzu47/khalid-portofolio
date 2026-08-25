import Link from 'next/link';
import { CertificatesService } from '@/services/certificates.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { DeleteCertificateButton } from './DeleteCertificateButton';
import { Plus, Edit, ExternalLink, Award, CheckCircle2 } from 'lucide-react';

export default async function AdminCertificatesPage() {
  const result = await CertificatesService.getAdminCertificates({ page: 1, pageSize: 50 });
  const certList = result.data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold font-mono text-terminal-text-primary flex items-center space-x-2">
            <Award className="w-5 h-5 text-terminal-warning" />
            <span>Certifications & Credentials</span>
          </h1>
          <p className="text-xs font-mono text-terminal-text-secondary">
            Manage industry certifications, credential IDs, validation URLs, and verified skills.
          </p>
        </div>

        <Link
          href="/admin/certificates/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded bg-terminal-primary text-terminal-bg font-mono text-xs font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Certificate</span>
        </Link>
      </div>

      {/* Certificates Data Table */}
      {certList.length === 0 ? (
        <div className="p-12 text-center border border-terminal-border rounded-lg bg-terminal-surface font-mono text-xs text-terminal-text-muted space-y-3">
          <p>No certificates recorded in the repository.</p>
          <Link
            href="/admin/certificates/new"
            className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
          >
            <span>Register your verified certifications</span>
          </Link>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate & Issuer</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Credential ID</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certList.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-terminal-text-primary flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-terminal-primary" />
                      <span>{cert.name}</span>
                    </div>
                    <div className="text-[11px] text-terminal-text-muted">
                      {cert.issuer}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="font-mono text-xs text-terminal-text-muted whitespace-nowrap">
                  <span>{cert.issuedAt}</span>
                  {cert.expiresAt && (
                    <span className="text-[11px] block text-terminal-text-secondary">
                      Exp: {cert.expiresAt}
                    </span>
                  )}
                </TableCell>

                <TableCell className="font-mono text-xs text-terminal-secondary">
                  {cert.credentialId || '—'}
                </TableCell>

                <TableCell className="font-mono text-xs text-terminal-text-muted">
                  {cert.credentialUrl ? (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-terminal-primary hover:underline"
                    >
                      <span>Verify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <Link
                      href={`/admin/certificates/${cert.id}/edit`}
                      className="p-1.5 rounded text-terminal-text-muted hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors"
                      title="Edit Certificate"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteCertificateButton
                      certificateId={cert.id}
                      certificateName={cert.name}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
