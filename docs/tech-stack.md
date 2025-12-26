# Tech Stack & Architecture

## 1. Core Stack (Confirmed)

*   **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
*   **Backend**: Node.js + Express + TypeScript
*   **Database**: MongoDB + Mongoose
*   **Queue/Jobs**: BullMQ + Redis
*   **AI Services**: OpenAI Whisper (Audio-to-Text) + GPT-4o-mini/GPT-4o (Content Gen)
*   **Storage**: AWS S3 (for video/audio files)
*   **Authentication**: Clerk

## 2. Stack Validation

This stack is highly suitable for the Clueso.io clone MVP for the following reasons:

*   **Decoupled Architecture**: Using a separate Express backend (vs. Next.js API routes) is the correct choice here. Video processing and long-running AI tasks are better managed in a dedicated Node.js process where you have full control over timeouts and memory, rather than the ephemeral nature of Vercel serverless functions.
*   **Async Processing**: The inclusion of `BullMQ` + `Redis` is critical. Transcription and Content Generation are slow operations (minutes). Handling these asynchronously ensures the UI remains responsive.
*   **Schema Flexibility**: MongoDB is excellent for storing semi-structured data like Transcripts (which often have varying structures, timestamps, and speaker labels) and changing JSON outputs from AI.
*   **Rapid Development**: Clerk, Tailwind, and Next.js allow for extremely fast UI and Auth implementation, freeing up time to focus on the complex backend logic.

## 3. Weak Points & Risks

*   **Type Safety Disconnect**: With a separate Frontend and Backend, you lose the automatic type safety you might get from tRPC or Server Actions. If the Backend API changes, the Frontend might break silently.
*   **Infrastructure Complexity**: Managing a Redis instance and potentially a separate backend deployment adds more DevOps overhead compared to a pure "Serverless Next.js" stack.
*   **Cost/Latency**: Validating the video processing pipeline (Upload -> S3 -> Download to Server -> Processing) involves bandwidth and latency.
*   **State Sync**: Keeping the Frontend UI (Project Status) in sync with the Background Job progress requires polling or WebSockets.

## 4. Proposed Improvements (Minor)

These improvements fit within the existing constraints but enhance robustness and DX:

### A. Shared Type Definitions (Monorepo/Workspace)
*   **Proposal**: Use a simple mechanism to share TypeScript interfaces between Frontend and Backend.
*   **Reason**: Ensures that the `Project` or `Transcript` interface is identical on both sides.
*   **Implementation**: A `shared` folder or workspace package containing Zod schemas and TS types.

### B. Zod for Runtime Validation
*   **Proposal**: Use **Zod** for environment variables, API request bodies, and database schemas.
*   **Reason**: TypeScript checks types at compile time; Zod ensures the data actually matches those types at runtime (e.g., validating incoming webhook payloads or AI JSON responses).

### C. Polling Hook for Job Status
*   **Proposal**: Implement a standardized `useJobStatus` hook on the frontend using `SWR` or `TanStack Query`.
*   **Reason**: Since we aren't using WebSockets (simplicity), smart polling is needed to update the UI when the "Transcription" is done.

### D. Structured Logging
*   **Proposal**: Use **Pino** or **Winston** in the backend.
*   **Reason**: Debugging background jobs is hard. Structured JSON logs with correlation IDs will make it easier to trace a failed job back to the request that triggered it.

### E. Rate Limiting
*   **Proposal**: Add `express-rate-limit`.
*   **Reason**: AI API calls are expensive. Prevent accidental loops or abuse from draining credits.
