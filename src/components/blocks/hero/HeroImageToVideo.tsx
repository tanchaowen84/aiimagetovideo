'use client';

import { Button as ShadcnButton } from '@/components/ui/button';
import { CardContent, Card as ShadcnCard } from '@/components/ui/card';
import { Input as ShadcnInput } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

import React, { useState, useRef } from 'react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            AI Image to Video
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            Transform Your Images with AI
          </p>
          <p className="mt-4 text-base text-gray-400 max-w-3xl mx-auto">
            Create stunning videos from any image using AI. Simple, fast, and no
            experience needed.
          </p>
        </div>

        {/* Main Tool Interface */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Input Controls */}
            <ShadcnCard className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Upload Section */}
                  <div>
                    <label
                      htmlFor="hero-file"
                      className="block text-sm font-medium text-gray-300 mb-3"
                    >
                      Upload Image
                    </label>
                    <div className="relative">
                      <ShadcnInput
                        ref={fileInputRef}
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
                        <div
                          className="bg-gray-800/30 border-gray-600 border-2 border-dashed rounded-lg"
                          style={{ aspectRatio: '16 / 9' }}
                        >
                          <label
                            htmlFor="hero-file"
                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-700/20 transition-colors rounded-lg"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className="w-8 h-8 mb-4 text-gray-400"
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
                              <p className="mb-2 text-sm text-gray-300">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{' '}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-400">
                                JPG, PNG, WebP (MAX. 10MB)
                              </p>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div
                          className="bg-gray-800/30 border-gray-600 border rounded-lg relative overflow-hidden"
                          style={{ aspectRatio: '16 / 9' }}
                        >
                          <img
                            src={job.inputImagePreviewUrl}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover"
                          />
                          <ShadcnButton
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 h-8 w-8 p-0"
                            onClick={() => {
                              // Reset file input value to allow re-uploading the same file
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }

                              setJob((j) => ({
                                ...j,
                                status: 'idle',
                                inputImagePreviewUrl: undefined,
                                uploadedFile: undefined,
                                resultVideoUrl: undefined,
                                errorMessage: undefined,
                              }));
                            }}
                          >
                            ×
                          </ShadcnButton>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prompt Section */}
                  <div className="mb-8">
                    <div className="space-y-2">
                      <label
                        htmlFor="motion-textarea"
                        className="text-sm font-medium text-white"
                      >
                        Describe Motion
                      </label>
                      <Textarea
                        id="motion-textarea"
                        placeholder="What should happen in the video..."
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        maxLength={500}
                        rows={4}
                        className="w-full resize-none border-gray-600 bg-gray-800/50 text-white placeholder:text-gray-400 focus:border-gray-500 focus:ring-gray-500"
                      />
                      <p className="text-xs text-gray-400">
                        {promptInput.length}/500 characters
                      </p>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="mt-4">
                    <ShadcnButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2"
                    >
                      {showAdvanced ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                      Advanced Options
                    </ShadcnButton>

                    {showAdvanced && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="resolution-select"
                            className="text-sm font-medium text-white"
                          >
                            Resolution
                          </label>
                          <Select
                            value={resolution}
                            onValueChange={(value) =>
                              setResolution(value as '480p' | '580p' | '720p')
                            }
                          >
                            <SelectTrigger
                              id="resolution-select"
                              className="w-full border-gray-600 bg-gray-800/50 text-white focus:border-gray-500 focus:ring-gray-500"
                            >
                              <SelectValue placeholder="Select resolution" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem
                                value="480p"
                                className="text-white focus:bg-gray-700 focus:text-white"
                              >
                                480p (Fast)
                              </SelectItem>
                              <SelectItem
                                value="580p"
                                className="text-white focus:bg-gray-700 focus:text-white"
                              >
                                580p (Balanced)
                              </SelectItem>
                              <SelectItem
                                value="720p"
                                className="text-white focus:bg-gray-700 focus:text-white"
                              >
                                720p (Best Quality)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Generate Button */}
                  <ShadcnButton
                    size="lg"
                    onClick={onGenerate}
                    disabled={!canGenerate || isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2"
                  >
                    {isLoading && (
                      <svg
                        className="animate-spin h-5 w-5"
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
                    )}
                    {isLoading ? 'Processing...' : 'Generate Video'}
                  </ShadcnButton>
                </div>
              </CardContent>
            </ShadcnCard>

            {/* Right Panel - Results */}
            <ShadcnCard className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Video Preview Title */}
                  <h3 className="block text-sm font-medium text-gray-300 mb-3">
                    Video Preview
                  </h3>

                  {/* Error Banner */}
                  {job.status === 'failed' && job.errorMessage && (
                    <ShadcnCard className="border-red-500/50 bg-red-900/20">
                      <CardContent className="p-4">
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
                            <h3 className="text-sm font-medium text-red-300">
                              Something went wrong
                            </h3>
                            <p className="mt-1 text-sm text-red-200">
                              {job.errorMessage}
                            </p>
                            <ShadcnButton
                              size="sm"
                              variant="outline"
                              onClick={onGenerate}
                              className="mt-3 border-red-500 text-red-300 hover:bg-red-500/10"
                            >
                              Try Again
                            </ShadcnButton>
                          </div>
                        </div>
                      </CardContent>
                    </ShadcnCard>
                  )}

                  {/* Video Preview */}
                  <ShadcnCard
                    className="bg-gray-800/30 border-gray-600"
                    style={{ aspectRatio: '16 / 9' }}
                  >
                    <CardContent className="p-0 flex items-center justify-center">
                      {job.resultVideoUrl ? (
                        <video
                          src={job.resultVideoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          controls
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <div className="text-6xl mb-4 text-gray-500">
                            <svg
                              className="w-16 h-16 mx-auto"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h1a1 1 0 010 2H6a1 1 0 01-1-1zm6 1a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-200 mb-2">
                            Your video will appear here
                          </h3>
                          <p className="text-sm text-gray-400">
                            Upload an image and add a prompt to get started
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </ShadcnCard>

                  {/* Placeholder for alignment with left side's Advanced Options */}
                  <div className="h-12" />
                </div>
              </CardContent>
            </ShadcnCard>
          </div>
        </div>
      </div>
    </section>
  );
}
