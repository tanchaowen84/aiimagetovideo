import { fal } from '@fal-ai/client';
import { NextResponse } from 'next/server';

// Configure fal credentials from environment if available
if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY });
}

// POST /api/fal/image-to-video
// Body: multipart/form-data with file (required), prompt (required), resolution (optional)
// Returns: { videoUrl: string; requestId: string }
export async function POST(req: Request) {
  try {
    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: 'Missing FAL_KEY env' },
        { status: 500 }
      );
    }

    // Only accept multipart/form-data
    const form = await req.formData();
    const file = form.get('file') as unknown as File | null;
    const prompt = (form.get('prompt') as string) || '';
    const resolution = (form.get('resolution') as string) || '';

    if (!file) {
      return NextResponse.json(
        { error: 'file is required' },
        { status: 400 }
      );
    }
    if (!prompt.trim()) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400 }
      );
    }

    // Upload file to fal storage to get a public URL
    const image_url = await fal.storage.upload(file as any);

    // Follow fal official sample strictly; only include resolution override
    const input: {
      image_url: string;
      prompt: string;
      resolution?: '480p' | '580p' | '720p';
    } = {
      image_url,
      prompt: prompt.trim(),
    };
    if (
      resolution === '480p' ||
      resolution === '580p' ||
      resolution === '720p'
    ) {
      input.resolution = resolution;
    }

    // Log input shape for debugging (no sensitive keys)
    console.log('fal i2v request input:', input);

    const result = await fal.subscribe(
      'fal-ai/wan/v2.2-a14b/image-to-video/turbo',
      {
        input,
        logs: true,
        onQueueUpdate: () => {
          // No-op for now; we do not stream logs to client in this simple POST
        },
      }
    );

    const videoUrl = (result?.data as any)?.video?.url as string | undefined;
    if (!videoUrl) {
      // Try to surface provider error for easier debugging
      return NextResponse.json(
        { error: 'No video URL in response', provider: result?.data },
        { status: 502 }
      );
    }

    return NextResponse.json({ videoUrl, requestId: result.requestId });
  } catch (err: any) {
    const status = err?.status ?? 500;
    const body = err?.body ?? null;
    const message = err?.message || 'Internal error';

    // Print full details to server logs for diagnosis
    console.error('fal image-to-video error:', { message, status, body });

    if (status === 422) {
      return NextResponse.json(
        { error: 'Validation error from provider', detail: body },
        { status: 422 }
      );
    }

    return NextResponse.json({ error: message, detail: body }, { status: 500 });
  }
}
