'use client';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            AI Image to Video
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Transform Your Images with AI
          </p>
          <p className="mt-4 text-base text-gray-500 max-w-3xl mx-auto">
            Create stunning videos from any image using AI. Simple, fast, and no
            experience needed.
          </p>
        </div>

        {/* Main Tool Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              {/* Upload Section */}
              <div>
                <label
                  htmlFor="hero-file"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Upload Image
                </label>
                <div className="relative">
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
                    className="hidden"
                  />
                  {!job.inputImagePreviewUrl ? (
                    <label
                      htmlFor="hero-file"
                      className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      style={{ aspectRatio: '16 / 9' }}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{' '}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG, WebP (MAX. 10MB)
                        </p>
                      </div>
                    </label>
                  ) : (
                    <div
                      className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden"
                      style={{ aspectRatio: '16 / 9' }}
                    >
                      <img
                        src={job.inputImagePreviewUrl}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setJob((j) => ({
                            ...j,
                            status: 'idle',
                            inputImagePreviewUrl: undefined,
                            uploadedFile: undefined,
                            resultVideoUrl: undefined,
                            errorMessage: undefined,
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Section */}
              <div>
                <label
                  htmlFor="hero-prompt"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Describe Motion
                </label>
                <textarea
                  id="hero-prompt"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="What should happen in the video..."
                  maxLength={500}
                />
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-gray-500">
                    {promptInput.length}/500
                  </span>
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Advanced Options
                  {showAdvanced ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label
                        htmlFor="hero-resolution"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Resolution
                      </label>
                      <select
                        id="hero-resolution"
                        value={resolution}
                        onChange={(e) =>
                          setResolution(
                            e.target.value as '480p' | '580p' | '720p'
                          )
                        }
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="480p">480p (Fast)</option>
                        <option value="580p">580p (Balanced)</option>
                        <option value="720p">720p (Best Quality)</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Higher quality = slower generation
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={onGenerate}
                disabled={!canGenerate}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Generate Video</>
                )}
              </button>
            </div>

            {/* Right Panel - Preview */}
            <div className="space-y-6">
              {/* Video Preview Title */}
              <div>
                <h3 className="block text-sm font-medium text-gray-700 mb-3">
                  Video Preview
                </h3>
              </div>

              {/* Error Banner */}
              {job.status === 'failed' && job.errorMessage && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        Something went wrong
                      </h3>
                      <p className="mt-1 text-sm text-red-700">
                        {job.errorMessage}
                      </p>
                      <button
                        type="button"
                        onClick={onGenerate}
                        className="mt-3 inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing State */}
              {job.status === 'processing' && (
                <div className="rounded-lg border border-blue-300 bg-blue-50 p-6 text-center">
                  <div className="flex flex-col items-center">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-600 mb-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-blue-900 mb-2">
                      Generating video...
                    </h3>
                    <p className="text-sm text-blue-700 mb-4">
                      This may take a few moments
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full animate-pulse"
                        style={{ width: '65%' }}
                      />
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      "{promptInput.slice(0, 50)}
                      {promptInput.length > 50 ? '...' : ''}"
                    </p>
                    <p className="text-xs text-blue-600">
                      ~30 seconds remaining
                    </p>
                  </div>
                </div>
              )}

              {/* Video Preview */}
              <div
                className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: '16 / 9' }}
              >
                {job.resultVideoUrl ? (
                  <div className="relative w-full h-full">
                    <video
                      className="w-full h-full object-cover rounded-lg"
                      src={job.resultVideoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                    />
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4 text-gray-400">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h1a1 1 0 010 2H6a1 1 0 01-1-1zm6 1a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Your video will appear here
                    </h3>
                    <p className="text-sm text-gray-500">
                      Upload an image and add a prompt to get started
                    </p>
                  </div>
                )}
              </div>

              {/* Success Actions */}
              {job.status === 'success' && job.resultVideoUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-green-800">
                      Generated successfully!
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded text-green-700 bg-white hover:bg-green-50 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded text-green-700 bg-white hover:bg-green-50 transition-colors"
                    >
                      Share
                    </button>
                    <button
                      type="button"
                      onClick={onGenerate}
                      className="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded text-green-700 bg-white hover:bg-green-50 transition-colors"
                    >
                      Generate Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
