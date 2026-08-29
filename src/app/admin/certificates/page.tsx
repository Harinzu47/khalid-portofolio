import Link from 'next/link';
import { requireOwnerSession } from '@/lib/auth';
import { CertificatesService } from '@/services/certificates.service';
import { ArchiveCertificateButton } from './ArchiveCertificateButton';
import { Plus, Edit2, Award, ExternalLink, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCertificatesPage() {
  const session = await requireOwnerSession();
  const paginated = await CertificatesService.getAdminCertificates(session.userId, { pageSize: 100 });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-slate-100">Certificates & Credentials</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verified proof and examination credentials supporting skills, domains, and technologies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/certificates/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Certificate</span>
          </Link>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Certificate Name</th>
                <th className="py-3 px-4">Issuer</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Issued Date</th>
                <th className="py-3 px-4">Supported Taxonomy</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginated.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No certificates registered yet.
                  </td>
                </tr>
              ) : (
                paginated.data.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-100">{cert.name}</p>
                      {cert.title && <p className="text-slate-400 text-[11px]">{cert.title}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-300">{cert.issuer}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          cert.verificationStatus === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : cert.verificationStatus === 'expired'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {cert.verificationStatus || 'unverified'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {cert.issuedAt}
                        {cert.expiresAt ? ` (exp: ${cert.expiresAt})` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cert.skills.slice(0, 2).map((s) => (
                          <span
                            key={s.id}
                            className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]"
                          >
                            {s.name}
                          </span>
                        ))}
                        {cert.technologies.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="px-1.5 py-0.5 bg-blue-950/40 text-blue-300 rounded text-[10px]"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/certificates/${cert.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/30 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <ArchiveCertificateButton id={cert.id} title={cert.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
