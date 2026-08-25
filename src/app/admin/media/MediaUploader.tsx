'use client';

import React, { useState, useTransition, useRef } from 'react';
import { uploadMediaAction } from '@/actions/media';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';

export function MediaUploader() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', file.name.split('.')[0] || '');

    startTransition(async () => {
      const result = await uploadMediaAction(formData);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to upload file.');
      } else {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <Alert variant="destructive" title="Upload Failed">
          {errorMessage}
        </Alert>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
          isDragging
            ? 'border-terminal-primary bg-terminal-primary/10'
            : 'border-terminal-border bg-terminal-surface hover:border-terminal-secondary/60 hover:bg-terminal-surface-alt/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.svg,.pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isPending}
        />

        {isPending ? (
          <div className="flex flex-col items-center space-y-2 font-mono text-xs text-terminal-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span>Uploading asset to Supabase Storage...</span>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-full bg-terminal-bg border border-terminal-border text-terminal-primary">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-xs font-semibold text-terminal-text-primary">
                Click or drag & drop files here to upload
              </p>
              <p className="font-mono text-[11px] text-terminal-text-muted">
                Supports PNG, JPEG, WebP, SVG, PDF up to 10MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
