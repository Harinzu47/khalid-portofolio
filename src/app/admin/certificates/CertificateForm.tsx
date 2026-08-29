'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCertificateAction, updateCertificateAction } from '@/actions/certificates';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { CertificateEditorDTO, CertificateVerificationStatus } from '@/types/dtos';

const VERIFICATION_OPTIONS: { value: CertificateVerificationStatus; label: string }[] = [
  { value: 'unverified', label: 'Unverified' },
  { value: 'verified', label: 'Verified' },
  { value: 'expired', label: 'Expired' },
  { value: 'revoked', label: 'Revoked' },
];

interface CertificateFormProps {
  initialData?: CertificateEditorDTO;
  skillOptions: { id: string; name: string }[];
  domainOptions: { id: string; name: string }[];
  technologyOptions: { id: string; name: string }[];
}

export function CertificateForm({
  initialData,
  skillOptions,
  domainOptions,
  technologyOptions,
}: CertificateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [issuer, setIssuer] = useState(initialData?.issuer || '');
  const [issuedAt, setIssuedAt] = useState(initialData?.issuedAt || '');
  const [expiresAt, setExpiresAt] = useState(initialData?.expiresAt || '');
  const [credentialId, setCredentialId] = useState(initialData?.credentialId || '');
  const [credentialUrl, setCredentialUrl] = useState(initialData?.credentialUrl || '');
  const [certificateMediaId, setCertificateMediaId] = useState(
    initialData?.certificateMediaId || ''
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [verificationStatus, setVerificationStatus] = useState<CertificateVerificationStatus>(
    (initialData?.verificationStatus as CertificateVerificationStatus) || 'unverified'
  );
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>(
    initialData?.visibility || 'private'
  );

  const [skillIds, setSkillIds] = useState<string[]>(initialData?.skillIds || []);
  const [domainIds, setDomainIds] = useState<string[]>(initialData?.domainIds || []);
  const [technologyIds, setTechnologyIds] = useState<string[]>(initialData?.technologyIds || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: name.trim(),
      title: title.trim() || null,
      issuer: issuer.trim(),
      issuedAt,
      expiresAt: expiresAt || null,
      credentialId: credentialId.trim() || null,
      credentialUrl: credentialUrl.trim() || null,
      certificateMediaId: certificateMediaId || null,
      description: description.trim() || null,
      verificationStatus,
      visibility,
      skillIds,
      domainIds,
      technologyIds,
    };

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateCertificateAction(initialData.id, payload);
      } else {
        res = await createCertificateAction(payload);
      }

      if (!res.success) {
        setError(res.error || 'Failed to save certificate.');
      } else {
        router.push('/admin/certificates');
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/certificates"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Certificates</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg">
          {error}
        </div>
      )}

      {/* 1. Core Credential Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
          Certificate Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Certificate / Exam Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., AWS Certified Solutions Architect - Associate"
              required
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Issuing Organization <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="e.g., Amazon Web Services, CNCF, Google Cloud"
              required
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Issue Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
              required
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Expiration Date (optional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Verification Status
            </label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value as CertificateVerificationStatus)}
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {VERIFICATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Credential ID / Number
            </label>
            <input
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="e.g., AWS-ASA-198472"
              className="w-full px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Validation / Credential URL
            </label>
            <input
              type="url"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://credly.com/badges/..."
              className="w-full px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Scope & Syllabus Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Key exam domains tested, cloud architectures covered, and technical proficiencies verified..."
            className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* 2. Supported Taxonomy Alignment (Evidence Model - Amendment 26) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-xs">
          Evidence Supporting Taxonomy
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Supported Skills</label>
            <select
              multiple
              value={skillIds}
              onChange={(e) =>
                setSkillIds(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 h-28 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {skillOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Supported Domains</label>
            <select
              multiple
              value={domainIds}
              onChange={(e) =>
                setDomainIds(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 h-28 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {domainOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Supported Technologies
            </label>
            <select
              multiple
              value={technologyIds}
              onChange={(e) =>
                setTechnologyIds(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 h-28 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {technologyOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/admin/certificates"
          className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending || !name.trim() || !issuer.trim() || !issuedAt}
          className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-amber-500/20"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{initialData ? 'Update Certificate' : 'Register Certificate'}</span>
        </button>
      </div>
    </form>
  );
}
