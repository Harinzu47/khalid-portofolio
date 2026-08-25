'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCareerExperienceAction, updateCareerExperienceAction } from '@/actions/career';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export interface CareerFormProps {
  mode: 'create' | 'edit';
  experienceId?: string;
  initialData?: {
    organizationId?: string;
    newOrganizationName?: string;
    position?: string;
    employmentType?: string;
    location?: string | null;
    startDate?: string;
    endDate?: string | null;
    isCurrent?: boolean;
    description?: string | null;
    sortOrder?: number;
  };
  organizations: { id: string; name: string }[];
}

export function CareerForm({
  mode,
  experienceId,
  initialData,
  organizations,
}: CareerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [organizationId, setOrganizationId] = useState(initialData?.organizationId || '');
  const [newOrgName, setNewOrgName] = useState(initialData?.newOrganizationName || '');
  const [position, setPosition] = useState(initialData?.position || '');
  const [employmentType, setEmploymentType] = useState(initialData?.employmentType || 'Full-time');
  const [location, setLocation] = useState(initialData?.location || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [isCurrent, setIsCurrent] = useState(initialData?.isCurrent || false);
  const [description, setDescription] = useState(initialData?.description || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      organizationId: organizationId || undefined,
      newOrganizationName: newOrgName || undefined,
      position,
      employmentType,
      location: location || undefined,
      startDate,
      endDate: isCurrent ? null : endDate || null,
      isCurrent,
      description: description || undefined,
      sortOrder: Number(sortOrder) || 0,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createCareerExperienceAction(payload);
      } else if (mode === 'edit' && experienceId) {
        result = await updateCareerExperienceAction(experienceId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save career experience.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  const orgSelectOptions = [
    { value: '', label: '-- Select Existing Organization or Type New Below --' },
    ...organizations.map((org) => ({
      value: org.id,
      label: org.name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/career"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Career</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/career')}
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
              <span>{mode === 'create' ? 'Record Experience' : 'Save Changes'}</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" title="Validation Error">
          {errorMessage}
        </Alert>
      )}

      {/* Organization Selection */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Company & Organization
        </h2>

        <Select
          label="Existing Organization"
          value={organizationId}
          onChange={(e) => {
            setOrganizationId(e.target.value);
            if (e.target.value) setNewOrgName('');
          }}
          options={orgSelectOptions}
          error={fieldErrors.organizationId?.[0]}
        />

        <Input
          label="Or Create New Organization"
          value={newOrgName}
          onChange={(e) => {
            setNewOrgName(e.target.value);
            if (e.target.value) setOrganizationId('');
          }}
          placeholder="e.g. Acme Cloud Systems Inc."
        />
      </div>

      {/* Role & Dates */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Role Details & Timeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Position Title *"
            required
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            error={fieldErrors.position?.[0]}
            placeholder="e.g. Senior DevOps & Cloud Engineer"
          />

          <Select
            label="Employment Type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            options={[
              { value: 'Full-time', label: 'Full-time' },
              { value: 'Contract', label: 'Contract' },
              { value: 'Part-time', label: 'Part-time' },
              { value: 'Freelance', label: 'Freelance' },
              { value: 'Consultant', label: 'Consultant' },
            ]}
          />
        </div>

        <Input
          label="Location (City, Country / Remote)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Jakarta, Indonesia (Hybrid)"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date (YYYY-MM-DD) *"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={fieldErrors.startDate?.[0]}
          />

          <Input
            label="End Date (YYYY-MM-DD)"
            type="date"
            disabled={isCurrent}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={fieldErrors.endDate?.[0]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Switch
            checked={isCurrent}
            onCheckedChange={setIsCurrent}
            label="Currently Active Role (Present)"
            description="Marks this position as your active current employment."
          />
          <Input
            label="Display Sort Priority (Optional)"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Responsibilities & Achievements */}
      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Role Impact & Achievements
        </h2>

        <Textarea
          label="Description & Key Responsibilities"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="• Led migration of 14 microservices to Kubernetes...&#10;• Reduced latency by 45% using PgBouncer pooling..."
        />
      </div>
    </form>
  );
}
