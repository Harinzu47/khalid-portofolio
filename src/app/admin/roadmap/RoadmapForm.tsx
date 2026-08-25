'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createRoadmapItemAction, updateRoadmapItemAction } from '@/actions/roadmap';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { RoadmapItemFormInput } from '@/validations/roadmap';

export interface RoadmapFormProps {
  mode: 'create' | 'edit';
  itemId?: string;
  initialData?: {
    title?: string;
    description?: string | null;
    category?: string | null;
    status?: 'backlog' | 'planned' | 'in_progress' | 'completed';
    priority?: number | null;
    targetDate?: string | null;
    sortOrder?: number;
  };
}

export function RoadmapForm({ mode, itemId, initialData }: RoadmapFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || 'Infrastructure & Cloud');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<RoadmapItemFormInput['status']>(
    initialData?.status || 'backlog'
  );
  const [priority, setPriority] = useState<string>(
    initialData?.priority ? String(initialData.priority) : '3'
  );
  const [targetDate, setTargetDate] = useState(initialData?.targetDate || '');
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      title,
      category: category || undefined,
      description: description || undefined,
      status,
      priority: Number(priority) || 1,
      targetDate: targetDate || null,
      sortOrder: Number(sortOrder) || 0,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createRoadmapItemAction(payload);
      } else if (mode === 'edit' && itemId) {
        result = await updateRoadmapItemAction(itemId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save roadmap item.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/roadmap"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Roadmap</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/roadmap')}
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
              <span>{mode === 'create' ? 'Create Item' : 'Save Changes'}</span>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" title="Validation Error">
          {errorMessage}
        </Alert>
      )}

      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4">
        <h2 className="text-xs font-mono font-bold text-terminal-text-primary uppercase tracking-wider">
          Roadmap Milestone Specification
        </h2>

        <Input
          label="Milestone Title *"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={fieldErrors.title?.[0]}
          placeholder="e.g. Multi-Cluster Kubernetes Mesh Setup"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Domain / Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'Infrastructure & Cloud', label: 'Infrastructure & Cloud' },
              { value: 'Networking & Telecommunications', label: 'Networking & Telecommunications' },
              { value: 'AI & Machine Learning', label: 'AI & Machine Learning' },
              { value: 'Security & DevSecOps', label: 'Security & DevSecOps' },
              { value: 'Web Engineering', label: 'Web Engineering' },
            ]}
          />

          <Select
            label="Progress Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as RoadmapItemFormInput['status'])}
            options={[
              { value: 'backlog', label: 'Backlog (Queued)' },
              { value: 'planned', label: 'Planned (Next Up)' },
              { value: 'in_progress', label: 'In Progress (Active)' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Priority (1-5)"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: '1', label: '1 - Low Priority' },
              { value: '2', label: '2 - Medium-Low' },
              { value: '3', label: '3 - Normal Priority' },
              { value: '4', label: '4 - High Priority' },
              { value: '5', label: '5 - Critical / Urgent' },
            ]}
          />

          <Input
            label="Target Completion Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            error={fieldErrors.targetDate?.[0]}
          />
        </div>

        <Input
          label="Display Sort Priority"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
        />

        <Textarea
          label="Milestone Scope & Objectives"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Technical requirements, architecture goals, and success criteria..."
        />
      </div>
    </form>
  );
}
