'use client';

import React, { useState } from 'react';

interface HeroJob {
  id: string;
  status: 'idle' | 'uploaded' | 'processing' | 'success' | 'failed';
  inputImagePreviewUrl?: string;
  uploadedFile?: File;
  resultVideoUrl?: string;
  errorMessage?: string;
}

export function HeroImageToVideo() {
  const [job, setJob] = useState<HeroJob>({ id: 'local', status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const [promptInput, setPromptInput] = useState<string>('');
  const [resolution, setResolution] = useState<'480p' | '580p' | '720p'>(
    '480p'
  );

  const onFileSelected = (file: File) => {
    const preview = URL.createObjectURL(file);
    setJob((j) => ({
      ...j,
      status: 'uploaded',
      inputImagePreviewUrl: preview,
      uploadedFile: file,
      errorMessage: undefined,
    }));
  };

  const callFal = async (file: File, prompt: string, resolution: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('prompt', prompt);
    form.append('resolution', resolution);

    const res = await fetch('/api/fal/image-to-video', {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      let message = 'Fal request failed';
      try {
        const err = (await res.json()) as any;
        // Surface provider validation details when present
        if (Array.isArray(err?.detail)) {
          const details = err.detail
            .map((d: any) => {
              const loc = Array.isArray(d?.loc) ? d.loc.join('.') : d?.loc;
              return `${loc || 'input'}: ${d?.msg || JSON.stringify(d)}`;
            })
            .join(' | ');
          message = `${err?.error || 'Validation error'} - ${details}`;
        } else {
          message = err?.error || err?.message || JSON.stringify(err);
        }
      } catch {}
      throw new Error(message);
    }
    const data = (await res.json()) as { videoUrl: string };
    return data.videoUrl;
  };

  const onGenerate = async () => {
    if (!job.uploadedFile || !promptInput.trim()) return;

    try {
      setIsLoading(true);
      setJob((j) => ({ ...j, status: 'processing', errorMessage: undefined }));

      const videoUrl = await callFal(
        job.uploadedFile,
        promptInput.trim(),
        resolution
      );

      setJob((j) => ({ ...j, status: 'success', resultVideoUrl: videoUrl }));
    } catch (e: any) {
      setJob((j) => ({
        ...j,
        status: 'failed',
        errorMessage: e?.message || 'Something went wrong. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const canGenerate = job.uploadedFile && promptInput.trim() && !isLoading;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Top controls */}
      <div className="mb-6 space-y-4">
        {/* Upload */}
        <div>
          <label htmlFor="hero-file" className="mb-2 block text-sm font-medium">
            Upload Image (Required)
          </label>
          <input
            id="hero-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Basic validation
                if (file.size > 10 * 1024 * 1024) {
                  setJob((j) => ({
                    ...j,
                    errorMessage: 'File too large (max 10MB)',
                  }));
                  return;
                }
                onFileSelected(file);
              }
            }}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Prompt */}
        <div>
          <label
            htmlFor="hero-prompt"
            className="mb-2 block text-sm font-medium"
          >
            Prompt (Required)
          </label>
          <textarea
            id="hero-prompt"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            rows={3}
            className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what you want the video to show..."
            maxLength={500}
          />
          <div className="mt-1 text-right text-xs text-gray-500">
            {promptInput.length}/500
          </div>
        </div>

        {/* Resolution */}
        <div>
          <label
            htmlFor="hero-resolution"
            className="mb-2 block text-sm font-medium"
          >
            Resolution
          </label>
          <select
            id="hero-resolution"
            value={resolution}
            onChange={(e) =>
              setResolution(e.target.value as '480p' | '580p' | '720p')
            }
            className="block w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="480p">480p (Faster)</option>
            <option value="580p">580p (Balanced)</option>
            <option value="720p">720p (Higher Quality)</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          {isLoading ? 'Processing...' : 'Generate Video'}
        </button>
      </div>

      {/* Error Banner */}
      {job.status === 'failed' && job.errorMessage && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <div className="flex items-center justify-between gap-3">
            <span>{job.errorMessage}</span>
            <button
              type="button"
              onClick={onGenerate}
              className="rounded-md border border-red-300 px-2 py-1 text-xs hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Processing Placeholder */}
      {job.status === 'processing' && (
        <div className="mb-4 rounded-md border border-blue-300 bg-blue-50 p-4 text-center text-sm text-blue-800">
          Generating video... This may take a few moments.
        </div>
      )}

      {/* Side-by-side display */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left: Input Image */}
        <div
          className="rounded-xl border overflow-hidden bg-gray-100 flex items-center justify-center"
          style={{ aspectRatio: '16 / 9' }}
        >
          {job.inputImagePreviewUrl ? (
            <img
              alt="input"
              src={job.inputImagePreviewUrl}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="text-gray-500 text-sm">
              Upload an image to get started
            </div>
          )}
        </div>

        {/* Right: Result Video */}
        <div
          className="rounded-xl border overflow-hidden bg-gray-100 flex items-center justify-center"
          style={{ aspectRatio: '16 / 9' }}
        >
          {job.resultVideoUrl ? (
            <video
              className="h-full w-full object-cover"
              src={job.resultVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          ) : (
            <div className="text-gray-500 text-sm">
              Generated video will appear here
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
