'use client';

import React, { useState, useTransition } from 'react';
import { updateProfileAction } from '@/actions/settings';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loader2, Check, User } from 'lucide-react';

interface ProfileFormProps {
  initialData: {
    fullName: string;
    username: string;
    headline?: string | null;
    bio?: string | null;
    location?: string | null;
    websiteUrl?: string | null;
    avatarPath?: string | null;
    resumePath?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [fullName, setFullName] = useState(initialData.fullName || '');
  const [username, setUsername] = useState(initialData.username || '');
  const [headline, setHeadline] = useState(initialData.headline || '');
  const [bio, setBio] = useState(initialData.bio || '');
  const [location, setLocation] = useState(initialData.location || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialData.websiteUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const payload = {
      fullName,
      username,
      headline: headline || undefined,
      bio: bio || undefined,
      location: location || undefined,
      websiteUrl: websiteUrl || undefined,
    };

    startTransition(async () => {
      const res = await updateProfileAction(payload);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update profile.');
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      } else {
        setSuccessMessage('Operator profile successfully updated.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive" title="Update Failed">
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <div className="p-3 rounded bg-terminal-primary/10 border border-terminal-primary/40 text-terminal-primary font-mono text-xs flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="p-6 rounded-lg border border-terminal-border bg-terminal-surface space-y-4 font-mono">
        <h2 className="text-xs font-bold text-terminal-text-primary uppercase tracking-wider flex items-center space-x-2">
          <User className="w-4 h-4 text-terminal-primary" />
          <span>Operator Profile Identity</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors.fullName?.[0]}
          />
          <Input
            label="System Username *"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username?.[0]}
          />
        </div>

        <Input
          label="Headline Role"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Network & Infrastructure Engineer → Fullstack Developer"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Indonesia"
          />
          <Input
            label="Canonical Website URL"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://hzcode.my.id"
            error={fieldErrors.websiteUrl?.[0]}
          />
        </div>

        <Textarea
          label="Biography & Mission Statement"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Describe your technical background, domain specialization, and engineering principles..."
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
