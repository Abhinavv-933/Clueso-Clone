# 🎬 Clueso Clone — AI-Powered Video Transcription Platform

A full-stack, production-ready clone of Clueso.io, built to replicate its **core workflows, system architecture, and user experience** — not just the UI.

This project demonstrates real-world engineering skills including **secure video uploads, AI transcription pipelines, async workflows, frontend performance optimization, and cloud deployment**.

---

## 🚀 Live Demo
(Add deployed link here)

---

## 🧠 What This Project Does

- Upload videos securely
- Generate AI-powered transcripts
- Display transcripts asynchronously
- Edit transcripts in real-time
- Manage video projects
- Deliver a smooth, SaaS-grade user experience

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Clerk Authentication

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- AWS S3 (Presigned URLs)
- OpenAI Transcription API

### DevOps / Deployment
- Render
- Environment-based configuration
- Secure secrets handling

---

## 🏗 System Architecture

Client (Next.js)
→ Presigned URL (Backend)
→ AWS S3 (Video Storage)
→ Metadata saved to MongoDB
→ Async AI Transcription
→ Transcript stored & fetched
→ Editable Transcript UI

---

## ✨ Features

### ✅ Authentication
- Secure login/signup with Clerk
- Protected API routes
- Session-based user access

### ✅ Video Upload Pipeline
- Client-side validation
- Direct S3 upload using presigned URLs
- Metadata persistence in MongoDB
- No server-side file buffering

### ✅ Project Management
- Auto-create project after upload
- Project listing & detail pages
- Stable routing and navigation

### ✅ AI Transcription
- Asynchronous transcription trigger
- Non-blocking backend processing
- Progressive transcript loading
- Production-safe error handling

### ✅ Transcript Editor
- Editable transcript UI
- Optimized rendering for large text
- Smooth UX with async updates

### ✅ Performance Optimizations
- Fixed scroll-based UI lag
- Prevented unnecessary re-renders
- Optimized async state handling

---

## 🧩 Engineering Challenges Solved

### 1. Async Transcript Delay
**Problem:** Transcript appeared too late or only after refresh  
**Solution:**
- Background transcription job
- Polling/refetch strategy on frontend
- Status-based transcript fetching

### 2. Local vs Production Issues
**Problem:** Features worked locally but failed on deployment  
**Solution:**
- Environment-safe OpenAI integration
- Verified Render compatibility
- Removed local-only assumptions

### 3. Next.js Configuration Conflicts
**Problem:** `middleware.ts` & `proxy.ts` conflict  
**Solution:**
- Removed proxy
- Followed official Next.js middleware guidelines

### 4. Frontend Performance Bottlenecks
**Problem:** Slow scroll-based text rendering  
**Solution:**
- Optimized scroll listeners
- Reduced DOM updates
- Improved intersection observer usage

---

## 📁 Project Structure

frontend/
├─ app/
├─ components/
├─ services/
├─ styles/
└─ utils/

backend/
├─ controllers/
├─ routes/
├─ services/
├─ models/
├─ config/
└─ utils/

---

## 🔐 Environment Variables

### Backend
PORT=8000  
MONGODB_URI=your_mongo_uri  
AWS_ACCESS_KEY_ID=your_key  
AWS_SECRET_ACCESS_KEY=your_secret  
AWS_S3_BUCKET_NAME=your_bucket  
OPENAI_API_KEY=your_openai_key  
CLERK_SECRET_KEY=your_clerk_secret  

### Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000  
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key  

---

## ▶️ Running Locally

### Backend
cd backend  
npm install  
npm run dev  

### Frontend
cd frontend  
npm install  
npm run dev  

---

## 🧪 Current Status

- ✅ Video upload works
- ✅ Transcription works (local & deployed)
- ✅ Transcript editing works
- ✅ Deployment stable
- ✅ Production-ready architecture

---

## 🔮 Future Enhancements

- AI-powered transcript corrections
- AI voiceover generation
- Subtitle (.srt) export
- WebSocket-based real-time updates
- Video export with voiceover

---

## 📌 Why This Project Matters

This is **not a toy clone**.

It demonstrates:
- Real SaaS product understanding
- Backend async orchestration
- Cloud storage integration
- Frontend performance tuning
- Production debugging experience

Exactly what **recruiters look for in full-stack engineers**.

---

## 👨‍💻 Author

**Abhinav Dwivedi**  

## Clueso Clone – Architecture Documentation

[Architecture Documentation](docs/clueso-architecture/)
