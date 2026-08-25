'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createLearningGoalAction, updateLearningGoalAction } from '@/actions/roadmap';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { LearningGoalFormInput } from '@/validations/roadmap';

export interface LearningGoalFormProps {
  mode: 'create' | 'edit';
  goalId?: string;
  initialData?: {
    title?: string;
    description?: string | null;
    status?: 'planned' | 'in_progress' | 'completed' | 'abandoned';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    progress?: number;
    targetDate?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
  };
}

export function LearningGoalForm({ mode, goalId, initialData }: LearningGoalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<LearningGoalFormInput['status']>(
    initialData?.status || 'planned'
  );
  const [priority, setPriority] = useState<LearningGoalFormInput['priority']>(
    initialData?.priority || 'medium'
  );
  const [progress, setProgress] = useState<number>(initialData?.progress || 0);
  const [targetDate, setTargetDate] = useState(initialData?.targetDate || '');
  const [startedAt, setStartedAt] = useState(initialData?.startedAt || '');
  const [completedAt, setCompletedAt] = useState(initialData?.completedAt || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      title,
      description: description || undefined,
      status,
      priority,
      progress: Number(progress) || 0,
      targetDate: targetDate || null,
      startedAt: startedAt || null,
      completedAt: completedAt || null,
    };

    startTransition(async () => {
      let result;
      if (mode === 'create') {
        result = await createLearningGoalAction(payload);
      } else if (mode === 'edit' && goalId) {
        result = await updateLearningGoalAction(goalId, payload);
      }

      if (result && !result.success) {
        setErrorMessage(result.error || 'Failed to save learning goal.');
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
          href="/admin/learning-goals"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-terminal-text-muted hover:text-terminal-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learning Goals</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/learning-goals')}
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
              <span>{mode === 'create' ? 'Create Goal' : 'Save Changes'}</span>
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
          Learning Objective Specification
        </h2>

        <Input
          label="Learning Goal Title *"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={fieldErrors.title?.[0]}
          placeholder="e.g. Master Rust for Async High-Throughput Network Proxies"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Learning Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as LearningGoalFormInput['status'])}
            options={[
              { value: 'planned', label: 'Planned' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'abandoned', label: 'Abandoned' },
            ]}
          />

          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value as LearningGoalFormInput['priority'])}
            options={[
              { value: 'low', label: 'Low Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'high', label: 'High Priority' },
              { value: 'urgent', label: 'Urgent Objective' },
            ]}
          />
        </div>

        {/* Progress Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-terminal-text-secondary">Progress Completion</span>
            <span className="text-terminal-primary font-bold">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-1.5 bg-terminal-bg rounded-lg appearance-none cursor-pointer accent-terminal-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Target Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            error={fieldErrors.targetDate?.[0]}
          />
          <Input
            label="Started Date"
            type="date"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            error={fieldErrors.startedAt?.[0]}
          />
          <Input
            label="Completed Date"
            type="date"
            value={completedAt}
            onChange={(e) => setCompletedAt(e.target.value)}
            error={fieldErrors.completedAt?.[0]}
          />
        </div>

        <Textarea
          label="Syllabus & Learning Notes"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Topics covered, reference books, courses, and target benchmark projects..."
        />
      </div>
    </form>
  );
}
