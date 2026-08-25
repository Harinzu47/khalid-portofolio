'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCertificateAction, updateCertificateAction } from '@/actions/certificates';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export interface CertificateFormProps {
  mode: 'create' | 'edit';
  certificateId?: string;
  initialData?: {
    name?: string;
    issuer?: string;
    issuedAt?: string;
    expiresAt?: string | null;
    credentialId?: string | null;
    credentialUrl?: string | null;
    certificateMediaId?: string | null;
    description?: string | null;
  };
}

export function CertificateForm({
  mode,
  certificateId,
  initialData,
}: CertificateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [issuer, setIssuer] = useState(initialData?.issuer || '');
  const [issuedAt, setIssuedAt] = useState(initialData?.issuedAt || '');
  const [expiresAt, setExpiresAt] = useState(initialData?.expiresAt || '');
  const [credentialId, setCredentialId] = useState(initialData?.credentialId || '');
  const [credentialUrl, setCredentialUrl] = useState(initialData?.credentialUrl || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      name,
      issuer,
      issuedAt,
      expiresAt: expiresAt || null,
      credentialId: credentialId || undefined,
      credentialUrl: credentialUrl || undefined,
      description: description || undefined,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createCertificateAction(payload);
      } else if (mode === 'edit' && certificateId) {
        result = await updateCertificateAction(certificateId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save certificate.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/certificates"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certificates</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/certificates')}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{mode === 'create' ? 'Register Credential' : 'Save Changes'}</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" title="Validation Error">
          {errorMessage}
        </Alert>
      )}

      {/* Primary Certificate Details */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Certificate Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Certificate / Exam Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name?.[0]}
            placeholder="e.g. MikroTik Certified Network Associate (MTCNA)"
          />

          <Input
            label="Issuing Organization *"
            required
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            error={fieldErrors.issuer?.[0]}
            placeholder="e.g. MikroTik, AWS, CNCF, Google Cloud"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Issue Date (YYYY-MM-DD) *"
            type="date"
            required
            value={issuedAt}
            onChange={(e) => setIssuedAt(e.target.value)}
            error={fieldErrors.issuedAt?.[0]}
          />

          <Input
            label="Expiration Date (leave empty if non-expiring)"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            error={fieldErrors.expiresAt?.[0]}
          />
        </div>
      </div>

      {/* Verification & Proof */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Verification & Credential Proof
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Credential ID / Certificate Number"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            error={fieldErrors.credentialId?.[0]}
            placeholder="e.g. 2309NA8745"
          />

          <Input
            label="Verification / Validation URL"
            value={credentialUrl}
            onChange={(e) => setCredentialUrl(e.target.value)}
            error={fieldErrors.credentialUrl?.[0]}
            placeholder="https://mikrotik.com/certificate/search"
          />
        </div>

        <Textarea
          label="Syllabus & Scope Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Routing Protocols, Firewall Filtering, NAT, Queues QoS, Wireless Networks..."
        />
      </div>
    </form>
  );
}
