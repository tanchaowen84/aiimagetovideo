# Handoff: Homepage Hero Concept B (Draggable Before/After Slider)

Status: Draft (no code yet)
Owner: Augment Agent
Date: 2025-08-12

## 1) Overview
- Scope: Feature-only. No pricing/billing/commercial model in this phase.
- Goal: Make homepage hero immediately usable for "AI Image → Video" with a memorable, interactive before/after experience.
- Concept: Draggable split slider showing the input image (left) and the generated video (right). The hero itself acts as the workbench entry.
- No real API yet: we will wire a placeholder flow to define the UX contract and prepare integration points.

## 2) What’s Included Now (Design and Contracts)
- Information architecture for homepage hero as direct work entry
- UX flows and states (idle → uploaded → processing → success/failed)
- Component inventory and props (draft)
- Placeholder data contracts (front-end only)
- Responsive and motion guidelines
- Accessibility notes
- Next steps checklist for implementation (without backend)

## 3) Out of Scope (for this handoff)
- Real model invocation / backend APIs
- Payment, quotas, credits, rate-limiting
- Real gallery/case studies (we will keep a placeholder area empty for now)

## 4) Information Architecture (Homepage Only)
- Top Navigation: Logo, basic menu, primary CTA ("Try demo" → scroll to hero work area)
- Hero Work Area (Concept B):
  - Upload/Choose Sample → Draggable Divider → Generate → Progress → Result (video)
  - Copy Link (share) and Download exposed right in the hero after success
- Below Hero: (Optional, later) lightweight explanation blocks; real gallery deferred

## 5) UX Flow (Homepage Hero)
1. Idle
   - Default shows a sample image on the left and a sample looping video on the right.
   - Divider handle is centered and gently animated to suggest interaction.
2. Upload
   - User uploads an image (drag & drop or click select). Left pane updates to user preview.
3. Generate (no real API yet)
   - User clicks "Generate" → show processing placeholder in the right pane (striped progress, status text).
4. Success (placeholder)
   - Right pane switches to a placeholder result video. Show: Play/Pause, Mute, Download (placeholder), Copy Link.
5. Failed (placeholder)
   - Show an error banner with concise reason and a Retry button.

Notes:
- Autoplay muted loop for videos (web-safe default); user can unmute.
- Copy Link uses a placeholder URL until backend is provided.

## 6) Visual & Motion Guidance
- Theme: dark base with electric blue/purple accent highlights.
- Divider: subtle glow and hover magnification; drag with smooth easing (250–300ms on release).
- Video card: light edge glow; fade-in on first appearance.
- Buttons: ripple feedback; clear disabled/loading states during processing.

## 7) States (State Machine)
- `idle` → `uploaded` → `processing` → `success` | `failed`
- Transitions:
  - `idle` → `uploaded` (after file select)
  - `uploaded` → `processing` (on Generate)
  - `processing` → `success` (mock timeout or manual trigger)
  - `processing` → `failed` (mock failure path)
  - `failed` → `processing` (Retry)

## 8) Component Inventory (Draft Props)

1) `BeforeAfterSlider`
- Purpose: Render left (image) and right (video) panes with a draggable divider.
- Props:
  - `leftImageUrl: string` (required)
  - `rightVideoUrl: string` (optional, can be sample while processing)
  - `initialRatio?: number` (0..1, default 0.5)
  - `onDragStart?(): void`
  - `onDragEnd?(ratio: number): void`
  - `disabled?: boolean` (disable dragging during certain states)

2) `HeroUpload`
- Purpose: Lightweight upload/select component used within the hero.
- Props:
  - `accept?: string[]` (default ["image/jpeg","image/png","image/webp"])
  - `maxSizeMB?: number` (default 10)
  - `onFileSelected(file: File): void`
  - `onError?(message: string): void`
  - `sampleImageUrl?: string` (fallback when user hasn't uploaded)

3) `GenerateCTA`
- Purpose: Primary button to trigger generation; shows loading/disabled states.
- Props:
  - `isLoading: boolean`
  - `onClick(): void`
  - `disabled?: boolean`

4) `ProcessingPlaceholder`
- Purpose: Visual placeholder for processing state.
- Props:
  - `message?: string` (default: "Processing…")

5) `VideoPlayerLite`
- Purpose: Autoplay-muted-loop video with minimal controls.
- Props:
  - `src: string`
  - `poster?: string`
  - `autoPlay?: boolean` (default true)
  - `muted?: boolean` (default true)
  - `loop?: boolean` (default true)

6) `CopyLinkButton`
- Purpose: Copy a URL to clipboard and toast user feedback.
- Props:
  - `url: string`
  - `onCopied?(): void`

7) `ErrorBanner`
- Purpose: Prominent inline error message with optional action.
- Props:
  - `message: string`
  - `onRetry?(): void`

## 9) Placeholder Data Contracts (Front-end only)

### 9.1 Job Shape (in-memory for now)
```ts
interface HeroJob {
  id: string;
  status: 'idle' | 'uploaded' | 'processing' | 'success' | 'failed';
  inputImagePreviewUrl?: string;
  resultVideoUrl?: string; // placeholder URL until backend is wired
  errorMessage?: string;
}
```

### 9.2 Placeholder URLs
- `SAMPLE_IMAGE_URL`: a bundled asset (local) for first-load left pane
- `SAMPLE_VIDEO_URL`: a bundled asset (short, muted loop) for first-load right pane
- `PLACEHOLDER_RESULT_URL`: the same as `SAMPLE_VIDEO_URL` until real backend exists
- `COPY_LINK_URL`: `${BASE_URL}/share/demo` (temporary)

## 10) Responsive Behavior
- Desktop: draggable divider (mouse/trackpad), generous side paddings.
- Mobile:
  - Primary: tap-to-toggle Before/After (two-state toggle) for easier control
  - Secondary: a thinner drag handle remains available for advanced users
  - Keep controls stacked vertically; ensure 44px touch targets

## 11) Accessibility
- Keyboard: divider focusable with left/right arrows to adjust ratio.
- ARIA: role descriptions for divider, video controls with accessible labels.
- Color contrast: ensure text/controls meet WCAG AA on dark theme.
- Motion: respect `prefers-reduced-motion` (disable non-essential animations).

## 12) Risks & Assumptions
- No real API or upload backend initially; we rely on in-memory placeholders.
- Video autoplay policies differ across browsers; muted default mitigates risk.
- Copy link uses a temporary URL until storage and asset URLs are available.

## 13) Implementation Plan (No Backend)
- Step 1: Build UI-only hero with sample assets and state machine
  - `HeroUpload`, `BeforeAfterSlider`, `GenerateCTA`, `ProcessingPlaceholder`, `VideoPlayerLite`, `CopyLinkButton`, `ErrorBanner`
  - Wire placeholder state transitions and sample media
- Step 2: Add mobile toggle mode for Before/After
- Step 3: Polish motion, toasts, and disabled/loading states
- Step 4: Introduce minimal integration points (functions) that later swap to real APIs

## 14) Integration Notes (Future)
- Replace placeholder state transitions with real API calls:
  - `uploadImage(file)` → returns `imageKey`
  - `createJob({ imageKey })` → returns `jobId`
  - `pollJob(jobId)` → returns `status, resultUrl`
- Replace placeholder URLs with real public URLs from storage/CDN.

## 15) Open Questions (Confirmation Needed)
1) Do we pre-load sample image + sample video on first paint? (recommended: yes)
2) Is a fixed placeholder share URL acceptable for now? (e.g., `${BASE_URL}/share/demo`)
3) Failure copy: short and neutral English messages OK?


## 16) UI Copy (Microcopy) — Placeholder
- Idle:
  - Title: "Turn your image into motion"
  - Subtitle: "Upload a picture and drag the slider to see the magic."
  - CTA: "Generate"
- Upload errors:
  - Type: "Unsupported file type. Please use JPG/PNG/WebP."
  - Size: "File is too large. Max 10MB."
- Processing:
  - "Processing… This usually takes a few seconds."
- Success:
  - "Your video is ready."
  - Copy link toast: "Link copied"
- Failed:
  - Generic: "Something went wrong. Please try again."

## 17) Media & Asset Specs (Placeholder)
- Sample image: 1280×720 (or 1080p alternative), < 300KB (optimized)
- Sample video: 3–5s, muted, looped
  - Formats: MP4 (H.264, AAC) + WebM (VP9/Opus) for broader compatibility
  - Poster image: 1280×720 WebP
  - Target size: ≤ 2MB per sample

## 18) Performance, SEO & Analytics Targets
- Performance:
  - LCP ≤ 2.5s (hero image poster prioritization)
  - CLS ≈ 0.00 (reserve media boxes)
  - JS budget for hero widgets ≤ 80KB gzip (initial)
- SEO/Meta (placeholder):
  - Title: "AI Image to Video — See It in Action"
  - Description: succinct one-liner
  - OG: fallback to `/og.png` if no specific result
- Analytics (later):
  - Respect Do Not Track; minimal event set (see §20)

## 19) Accessibility (Detailed)
- Tab order: Upload → Generate → Divider (focusable) → Player controls → Copy link → Download
- Divider keyboard control: arrows adjust ratio in small steps (e.g., 5%)
- ARIA:
  - Divider: `role="separator"` with `aria-orientation="vertical"`, `aria-valuenow`
  - Buttons: descriptive `aria-label` (e.g., "Copy result link")
- Motion: honor `prefers-reduced-motion` — disable slider animation glow, minimize transitions
- Contrast: verify AA for text on dark backgrounds

## 20) Telemetry Events (Names — Placeholder)
- `hero_upload_selected`
- `hero_generate_clicked`
- `hero_processing_shown`
- `hero_result_shown`
- `hero_copy_link_clicked`
- `hero_download_clicked`

## 21) QA Test Plan (No Backend)
- Functional
  - Upload accepts JPG/PNG/WebP; rejects others with correct error
  - Generate transitions: uploaded → processing → success/failed
  - Copy link copies placeholder URL to clipboard with toast
  - Video autoplays muted and loops; toggles play/mute
  - Divider drags smoothly; ratio persists during hover/drag end
- Responsive
  - Mobile: tap-to-toggle Before/After works; drag still possible
  - Landscape/portrait switch preserves layout
- Browsers
  - Latest Chrome, Safari, Firefox, Edge
  - iOS Safari, Android Chrome (autoplay muted)

## 22) Acceptance Criteria (UI-Only)
- A. First paint shows a sample before/after with centered draggable divider
- B. User can upload an image; left pane updates; errors shown for invalid files
- C. Clicking Generate shows processing placeholder; eventually shows sample result video
- D. Result shows Copy Link and Download (placeholders), and toasts on copy
- E. Keyboard navigation works across upload, generate, divider, player, copy
- F. Mobile toggle mode is available and usable with one hand
- G. No layout shifts on hero during interactions

## 23) Risks & Mitigations
- Autoplay blocked: use muted by default, show visible play control
- Heavy media: keep sample assets small; lazy-load below-the-fold videos
- Drag on mobile: provide tap-to-toggle fallback
- Clipboard permissions: use `navigator.clipboard` with graceful fallback

## 24) Future API Contract (Outline)
- `POST /api/upload-image` → `{ imageKey }`
- `POST /api/jobs` with `{ imageKey }` → `{ jobId }`
- `GET /api/jobs/:jobId` → `{ status: 'queued'|'processing'|'succeeded'|'failed', resultUrl? }`
- Asset URLs are public-read (or signed) for player and copy-link usage

## 25) Implementation Work Plan (UI-Only, No Code Yet)
- 1. Finalize copy and assets (sample image/video, poster)
- 2. Lock component APIs (props/events) per §8; define state machine per §7
- 3. Create interaction specs for desktop drag and mobile toggle
- 4. Prepare analytics event names (deferred wiring)
- 5. Prepare QA checklist and acceptance tests (manual runbook)
- 6. After approval: implement UI-only hero with placeholders; integrate to homepage

## 26) Internationalization (Later)
- Keep all UI copy in English strings for now
- Prepare message keys (e.g., `Hero.Upload`, `Hero.Generate`, `Hero.CopyLink`)
- Add Chinese locale once copy is finalized; avoid hard-coded strings in components (future)

## 27) Security & Privacy (Placeholder Mode)
- Images remain client-side for preview where possible (no network upload until backend exists)
- If preview uses object URLs, revoke on unmount
- Do not log user media content in analytics or console


## 28) Demo API (fal) Integration (Temporary)

Status: Design ready (no code yet)

### 28.1 Overview
- Purpose: Allow the homepage hero (Concept B) to call a demo Image→Video API so real video can replace placeholders upon success.
- Provider: fal ("@fal-ai/client")
- Endpoint: "fal-ai/wan/v2.2-a14b/image-to-video/turbo"
- Mode: Client→Server invocation recommended; however, for this handoff we document the API contract and state mapping without implementing.

### 28.2 Dependencies & Setup
- Library: "@fal-ai/client"
- Env: An API key/token is required (e.g., FAL_KEY). Do not expose secrets in the client bundle.
- Defaults: resolution=480p, aspect_ratio=auto, enable_safety_checker=true, enable_prompt_expansion=false, acceleration=none, seed=undefined
- Package manager: pnpm
- Local dev: Only use port 3000 for previews.

### 28.3 Request Shape (Input)
```ts
interface FalImageToVideoInput {
  image_url: string;  // Publicly accessible image URL (required)
  prompt: string;     // Text prompt guiding motion/camera movement
  resolution: '720p' | '1080p' | '4k' | string; // Demo uses '720p'
  aspect_ratio: 'auto' | '16:9' | '9:16' | '1:1' | string;
  enable_safety_checker: boolean;
  enable_prompt_expansion: boolean; // false in demo
  acceleration: 'none' | 'balanced' | 'max' | string; // demo uses 'none'
  seed?: number;     // Optional
}
```
Notes:
- The API expects a public image_url. If the user uploads a local file, we must first upload it to storage to obtain a public URL before calling fal. For a pure demo phase, we can restrict to bundled sample images or known remote URLs.

### 28.4 Example Usage (from provider’s demo)
```ts
import { fal } from "@fal-ai/client";

const result = await fal.subscribe(
  "fal-ai/wan/v2.2-a14b/image-to-video/turbo",
  {
    input: {
      image_url: "https://storage.googleapis.com/falserverless/model_tests/wan/dragon-warrior.jpg",
      prompt:
        "The white dragon warrior stands still, eyes full of determination and strength. The camera slowly moves closer or circles around the warrior, highlighting the powerful presence and heroic spirit of the character.",
      resolution: "720p",
      aspect_ratio: "auto",
      enable_safety_checker: true,
      enable_prompt_expansion: false,
      acceleration: "none",
      seed: undefined,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  }
);
console.log(result.data);
console.log(result.requestId);
```

### 28.5 Response Shape (Typical)
```json
{
  "video": {
    "url": "https://v3.fal.media/files/rabbit/9Tw9g2bVFkOEk8OYrohgr_output.mp4",
    "content_type": "application/octet-stream",
    "file_name": "tmp7suy260k.mp4",
    "file_size": 798335
  },
  "prompt": "...",
  "seed": 76549482
}
```

### 28.6 State Machine Mapping (HeroJob)
- Trigger: User clicks Generate
  - HeroJob.status: `uploaded` → `processing`
  - Invoke fal.subscribe with `logs: true`
- Progress:
  - `onQueueUpdate(status === 'IN_PROGRESS')` → update UI processing indicator; render logs optionally
- Success:
  - On resolve, map `result.data.video.url` → `HeroJob.resultVideoUrl`
  - HeroJob.status: `processing` → `success`
- Failure:
  - On error/exception/timeouts/safety-checker failure → HeroJob.status: `failed`; set `errorMessage`

### 28.7 Error Handling & Edge Cases
- Network/timeout: show inline ErrorBanner with Retry
- Safety checker triggered: surface concise copy; allow re-try with different prompt
- Missing/invalid image_url: validate before call; block Generate until a valid URL exists
- Clipboard/download: remain available after success; clipboard uses navigator.clipboard with fallback

### 28.8 Privacy & Security
- Do not log user media contents; if logs are enabled, ensure no sensitive payloads are printed
- Keep API keys server-side; do not expose via client bundle
- Respect Do Not Track; keep telemetry minimal (see §20)

### 28.9 Limitations (Demo Mode)
- Local file uploads without storage are not directly usable with fal; require a public URL or sample assets
- For the MVP, we may default to a sample image when the user-provided file lacks a public URL

### 28.10 Acceptance Criteria Addendum (Demo Mode)
- When Generate is clicked with a valid public image_url:
  - Processing state is shown with progress logs (optional UI)
  - On success, hero plays the returned video URL muted & looped
  - On failure, an inline error is shown with a Retry action

### 28.11 Next Steps (Implementation Hooks)
- Provide `invokeFalImageToVideo(input: FalImageToVideoInput): Promise<{ videoUrl: string; requestId: string }>`
- Decide storage strategy for user uploads (to obtain `image_url`)
- Wire state transitions (`uploaded` → `processing` → `success`/`failed`) to the real API call

---

Appendix
- Base URL: PORT 3000 only (local dev/preview). Keep all demo links under this port.
- Code style: English for code and documentation; use pnpm as the package manager.

