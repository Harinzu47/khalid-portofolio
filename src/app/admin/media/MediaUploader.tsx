'use client';

import React, { useState, useTransition, useRef } from 'react';
import { uploadMediaAction } from '@/actions/media';
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';

interface MediaUploaderProps {
  onUploadSuccess?: () => void;
}

export function MediaUploader({ onUploadSuccess }: MediaUploaderProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    setErrorMessage(null);

    // Client preliminary checks against centralized rules
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds the maximum limit of 25 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', 'private'); // Private by default (Amendment 5)

    startTransition(async () => {
      const result = await uploadMediaAction(formData);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to upload file.');
      } else {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (onUploadSuccess) {
          onUploadSuccess();
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
    <div className="space-y-3 font-mono text-xs">
      {errorMessage && (
        <div className="p-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 sm:p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
          isDragging
            ? 'border-terminal-primary bg-terminal-primary/10 scale-[0.99]'
            : 'border-terminal-border bg-terminal-surface hover:border-terminal-primary/50 hover:bg-terminal-surface-hover'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isPending}
        />

        {isPending ? (
          <div className="flex flex-col items-center space-y-2 text-terminal-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="font-semibold">Uploading asset & syncing metadata...</span>
          </div>
        ) : (
          <>
            <div className="p-3 rounded-full bg-terminal-bg border border-terminal-border text-terminal-primary">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-terminal-text-primary text-xs sm:text-sm">
                Click or drag & drop files here to upload
              </p>
              <p className="text-[11px] text-terminal-text-muted">
                Supported formats: JPEG, PNG, WebP, GIF, PDF (Images up to 10MB, Documents up to 25MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
