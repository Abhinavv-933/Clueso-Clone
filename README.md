# Clueso Clone — AI-Powered Video Transcription Platform

> A production-grade full-stack clone of [Clueso.io](https://clueso.io), replicating its core workflows, system architecture, and user experience — not just the UI.

🔗 **Live Demo:** [clueso-clone-khaki.vercel.app](https://clueso-clone-khaki.vercel.app/)

---

## Overview

Clueso Clone is a SaaS-grade video transcription platform where users upload videos, generate AI-powered transcripts asynchronously, and edit or rewrite them in real time. The project demonstrates real-world engineering under real-world constraints — secure direct-to-cloud uploads, an async AI pipeline that adapts to file size, LLM-powered transcript rewriting, and an architecture deliberately designed to run entirely on free-tier infrastructure.

A defining theme of this project: **free-tier limits as an architectural driver.** Every major design decision — hosted inference over local models, signed direct uploads over server buffering, conditional audio extraction over always-on FFmpeg — exists because the system had to be production-stable on a 512MB backend instance at $0/month.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS |
| **Auth** | Clerk |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB (Mongoose) |
| **Storage** | Cloudinary (signed direct uploads, authenticated assets) |
| **Transcription** | Groq API — `whisper-large-v3` |
| **Transcript Rewriting** | Groq API — `llama-3.3-70b-versatile` |
| **Media Processing** | FFmpeg (fallback path only, bundled via `ffmpeg-static`) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## System Architecture

```
Client (Next.js on Vercel)
  └─→ Request signed upload params (Express on Render)
        └─→ Direct browser upload to Cloudinary (authenticated asset)
              └─→ Save metadata + create job in MongoDB
                    └─→ Async transcription worker:
                          ├─ file ≤ 24MB & Groq-accepted format
                          │    └─→ send video DIRECTLY to Groq Whisper
                          └─ file too large / unsupported format
                               └─→ FFmpeg extracts mono 48kbps audio
                                     └─→ send extracted audio to Groq
                    └─→ Transcript + timestamped segments → MongoDB
                          └─→ Client polling picks up COMPLETED status
                                └─→ Editable transcript UI
                                      └─→ (optional) LLM rewrite via Groq
```

**Key properties of this design:**

- **Secrets live in one place.** The browser never sees Cloudinary or Groq credentials — it receives short-lived upload signatures from the backend. Two full provider migrations (S3→Cloudinary, OpenAI-planned→Groq) required **zero frontend config changes**.
- **The AI provider is a swappable detail.** Transcription and rewriting are isolated behind worker/service modules. The transcription provider has been swapped twice with the pipeline design surviving intact.
- **The heavy path is the exception, not the rule.** Most uploads skip FFmpeg entirely — Groq accepts video containers (mp4/webm/m4a) directly, so CPU-bound extraction only runs for oversized files.

---

## Features

### Authentication
- Secure login/signup via Clerk
- API routes protected by an explicit auth guard returning **JSON 401s** (never redirects) — page-auth and API-auth semantics deliberately separated

### Video Upload Pipeline
- Client-side file validation
- Signed direct browser-to-Cloudinary uploads (SHA-256 request signing) — the server never buffers file bytes
- Assets stored as `type: authenticated`, served via signed delivery URLs
- Metadata + job records persisted to MongoDB

### AI Transcription
- Async, non-blocking pipeline triggered post-upload
- **Size-aware routing:** files ≤ 24MB in Groq-accepted formats go straight to `whisper-large-v3`; larger files fall back to FFmpeg extraction (mono, 48kbps — a 71MB screen recording reduces to ~1MB of audio)
- `verbose_json` responses store **timestamped segments** alongside plain text, unlocking future subtitle export and click-to-seek
- Status-driven polling UI with progressive updates

### Transcript Editor & AI Rewrite
- Real-time editable transcript UI, optimized for large text blocks
- One-click transcript rewriting via `llama-3.3-70b-versatile` on Groq (~700ms round trips)
- Rate-limit-aware error handling (429s surfaced distinctly) and oversized-input guards

### Project Management
- Auto-create project on upload
- Project listing and detail pages with stable routing

---

## Engineering Challenges

### Free-Tier Constraints as Architecture
**Problem:** Local Whisper transcription crashed Render's 512MB instance; OpenAI and AWS S3 free allowances were exhausted.
**Solution:** Migrated transcription to Groq's hosted `whisper-large-v3` and storage to Cloudinary signed uploads. Later applied the same lesson to transcript rewriting — replacing a local Ollama/llama3 server (which could never run on Render) with Groq's hosted Llama. The pattern: *never depend on local model infrastructure the deployment target can't support.*

### Eliminating FFmpeg from the Happy Path
**Problem:** Always-on audio extraction meant every job spawned a CPU-heavy FFmpeg subprocess — the exact workload that gets OOM-killed on a constrained instance.
**Solution:** Leveraged Groq's native container support (mp4/webm/m4a accepted directly) and made extraction conditional on file size. FFmpeg became an escape hatch for oversized files rather than a mandatory step, with `-vn -ac 1 -b:a 48k` producing minimal mono audio (~0.35MB/min) that keeps even long videos under the API's 25MB request cap.

### Cloudinary SDK Configuration Resolution
**Problem:** `CLOUDINARY_URL` was set, yet the SDK resolved `cloud_name` as undefined — silently signing uploads with empty credentials while every endpoint returned 200.
**Solution:** Replaced reliance on the SDK's env auto-detection with explicit URL parsing (`cloudinary://key:secret@cloud_name` → `new URL()`), deterministic config, and **fail-fast startup validation** that crashes with a named error instead of failing deep inside a worker. Also required opting into SHA-256 request signing, which newer Cloudinary accounts mandate but the SDK doesn't default to.

### API Auth Semantics
**Problem:** Clerk's default `requireAuth()` redirects unauthenticated requests — correct for pages, wrong for APIs. A token-hydration race caused a 302 → HTML 404 → `Unexpected token '<'` JSON parse crash in the frontend.
**Solution:** Replaced redirects with an explicit guard middleware returning structured JSON 401s, added `response.ok` checks in the frontend service layer, and gated requests on Clerk session readiness.

### Build & Deploy Divergence
**Problem:** Features passed locally but failed on Render — stale compiled `dist/` output committed to git shadowed source changes, and build-time TypeScript dependencies were unavailable in production installs.
**Solution:** Removed compiled output from version control, restructured dependency placement for Render's build step, and sequenced deploys (backend before frontend) to avoid route-rename skew.

---

## Project Structure

```
frontend/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components
├── context/       # React context providers (projects, etc.)
├── services/      # API service layer
└── utils/         # Helper utilities

backend/src/
├── config/        # env validation (zod, fail-fast), cloudinary config
├── middleware/    # auth guard (JSON 401s)
├── controllers/   # Route handler logic
├── routes/        # Express route definitions
├── clueso/
│   ├── services/  # Pipeline orchestration, Groq service
│   ├── workers/   # transcribeVideo (conditional pipeline), voiceover
│   ├── models/    # Job schema (transcript + segments)
│   └── ...
├── models/        # Mongoose schemas
└── utils/         # Shared utilities
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB URI
- Cloudinary account (free tier)
- Groq API key (free tier)
- Clerk account
- FFmpeg — optional; only needed to test the large-file fallback locally (production uses the bundled `ffmpeg-static` binary)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Backend (`.env`)

```env
PORT=8000
MONGODB_URI=your_mongo_uri
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
GROQ_API_KEY=your_groq_key
CLERK_SECRET_KEY=your_clerk_secret
```

All variables are validated at startup — the server fails fast with a named error if any are missing or malformed.

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
```

---

## Status

| Feature | Status |
|---|---|
| Video upload (signed, direct-to-Cloudinary) | ✅ Working |
| AI transcription (direct + FFmpeg fallback paths) | ✅ Working (local & production) |
| AI transcript rewriting (Groq Llama) | ✅ Working |
| Transcript editing | ✅ Working |
| Authentication (JSON API auth) | ✅ Working |
| Deployment | ✅ Stable |
| AI voiceover | 🔶 Stubbed |

---

## Future scope

- [ ] AI voiceover generation (un-stub with a hosted TTS provider)
- [ ] Subtitle (`.srt`) export — timestamped segments already stored per job
- [ ] Chunked transcription for multi-hour recordings exceeding API limits
- [ ] Click-transcript-to-seek video playback
- [ ] WebSocket-based real-time transcript updates (replacing polling)
- [ ] Video export with embedded voiceover

---

## Author

**Abhinav Dwivedi**

📄 [Architecture Documentation](docs/clueso-architecture/)