# Clueso Clone — AI-Powered Video Transcription Platform

> A production-grade full-stack clone of [Clueso.io](https://clueso.io), replicating its core workflows, system architecture, and user experience — not just the UI.

🔗 **Live Demo:** [clueso-clone-khaki.vercel.app](https://clueso-clone-khaki.vercel.app/)

---

## Overview

Clueso Clone is a SaaS-grade video transcription platform where users can upload videos, generate AI-powered transcripts asynchronously, and edit them in real time. The project demonstrates real-world engineering — from secure cloud uploads to async AI pipelines and frontend performance optimization.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS |
| **Auth** | Clerk |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (Mongoose) |
| **Storage** | AWS S3 (Presigned URLs) |
| **AI** | OpenAI Transcription API |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## System Architecture

```
Client (Next.js)
  └─→ Request presigned URL (Express Backend)
        └─→ Direct upload to AWS S3
              └─→ Save metadata to MongoDB
                    └─→ Trigger async AI transcription (OpenAI)
                          └─→ Store transcript in MongoDB
                                └─→ Fetch & display in editable UI
```

---

## Features

### Authentication
- Secure login/signup via Clerk
- Protected API routes with session-based access

### Video Upload Pipeline
- Client-side file validation
- Direct-to-S3 upload using presigned URLs (no server-side buffering)
- Metadata saved to MongoDB post-upload

### Project Management
- Auto-create project on upload
- Project listing and detail pages with stable routing

### AI Transcription
- Async, non-blocking transcription triggered post-upload
- Polling-based frontend refresh for progressive loading
- Status-driven transcript fetching

### Transcript Editor
- Real-time editable transcript UI
- Optimized rendering for large text blocks
- Smooth async state updates

---

## Engineering Challenges

### Async Transcript Delay
**Problem:** Transcript appeared only after a manual page refresh.  
**Solution:** Implemented a background transcription job with a polling/refetch strategy and status-based conditional fetching on the frontend.

### Local vs Production Divergence
**Problem:** Features passed locally but failed on Render.  
**Solution:** Audited and hardened all environment-dependent code paths; verified OpenAI SDK compatibility with Render's runtime.

### Next.js Middleware Conflict
**Problem:** `middleware.ts` and `proxy.ts` clashed, breaking routing.  
**Solution:** Removed the proxy layer and aligned implementation with Next.js official middleware patterns.

### Frontend Performance
**Problem:** Scroll-based rendering caused visible lag on long transcripts.  
**Solution:** Optimized scroll listeners, reduced unnecessary DOM updates, and improved Intersection Observer usage.

---

## Project Structure

```
frontend/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components
├── services/      # API service layer
├── styles/        # Global styles
└── utils/         # Helper utilities

backend/
├── controllers/   # Route handler logic
├── routes/        # Express route definitions
├── services/      # Business logic & AI integration
├── models/        # Mongoose schemas
├── config/        # Environment & app config
└── utils/         # Shared utilities
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB URI
- AWS S3 bucket with credentials
- OpenAI API key
- Clerk account

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
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET_NAME=your_bucket
OPENAI_API_KEY=your_openai_key
CLERK_SECRET_KEY=your_clerk_secret
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
```

---

## Status

| Feature | Status |
|---|---|
| Video upload | ✅ Working |
| AI transcription | ✅ Working (local & deployed) |
| Transcript editing | ✅ Working |
| Authentication | ✅ Working |
| Deployment | ✅ Stable |

---

## Roadmap

- [ ] AI-powered transcript corrections
- [ ] AI voiceover generation
- [ ] Subtitle (`.srt`) export
- [ ] WebSocket-based real-time transcript updates
- [ ] Video export with embedded voiceover

---

## Author

**Abhinav Dwivedi**  

📄 [Architecture Documentation](docs/clueso-architecture/)
