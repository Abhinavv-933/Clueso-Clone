# User Flow - Clueso.io Clone (MVP)

## 1. Landing Page (Public)
**Goal:** Convert visitors to signups.

*   **View**: Simple hero section with "Transform Video into Blogs" value prop.
*   **User Actions**:
    *   Click "Get Started" -> Redirect to /auth.
*   **Backend Actions**: None.

## 2. Authentication Page (/auth/login (implemented via Clerk))
**Goal:** Secure access.

*   **View**: Clerk-hosted login/signup form (Email/Password or Google).
*   **User Actions**:
    *   Enter credentials -> Submit.
*   **Backend Actions**:
    *   `POST /api/webhooks/clerk`: Sync user data to local database on successful signup.
    *   Redirect to `/dashboard` on success.

## 3. Dashboard (`/dashboard`)
**Goal:** Overview of projects and start new one.

*   **View**: Grid/List of existing projects. "New Project" button prominent.
*   **User Actions**:
    *   Click "New Project" -> Opens "Create Project" Modal/Page.
    *   Click existing project card -> Navigate to `/project/[id]`.
*   **Empty State**:
    *   "No videos yet. Repurpose your first video!" with a large CTA button.
*   **Loading State**:
    *   Skeleton loader for project cards.

## 4. Create Project (`/dashboard/new`)
**Goal:** Input video source.

*   **View**: Two tabs - "Upload Video" and "YouTube URL".
*   **User Actions**:
    *   **Action A (Upload)**: Drag & drop MP4.
        *   **Frontend**: Validate size (<500MB). Show progress bar.
    *   **Action B (URL)**: Paste YouTube link -> Click "Import".
        *   **Frontend**: Validate URL format.
*   **Backend Actions**:
    *   **Upload**: `POST /api/upload` -> Upload to AWS S3/Cloudflare R2.
    *   **URL**: `POST /api/import` -> Trigger background job to download audio.
    *   **Both**: Create `Project` record in DB with status `PROCESSING`.
    *   **Trigger**: Start transcription job (Whisper/Deepgram).
    *   **Redirect**: To `/project/[id]` immediately.

## 5. Project View - Processing State (`/project/[id]`)
**Goal:** Keep user informed during async processing.

*   **View**: minimalist page with status steps:
    1.  [x] Uploading...
    2.  [>] Transcribing... (Spinner)
    3.  [ ] Generating Content...
*   **User Actions**:
    *   Wait or leave page (email notification on completion - *Optional for MVP, nice to have*).
*   **Backend Actions**:
    *   Polling or WebSocket to check job status.
    *   Once processing completes -> Auto-refresh to **Result State**.

## 6. Project View - Result State (`/project/[id]`)
**Goal:** Consumption and Export.

*   **Layout**:
    *   **Left Panel**: Video Player (or Audio Player).
    *   **Center/Right Panel**: Tabs for "Transcript", "Blog", "Socials".

### Tab A: Transcript
*   **View**: Read-only text with timestamps. Speaker labels (Speaker A, Speaker B).
*   **User Actions**:
    *   Copy full transcript.

### Tab B: Blog Post
*   **View**: Formatted HTML/Markdown article. Title, Headers, Body.
*   **User Actions**:
    *   Click "Copy Markdown".
    *   Click "Copy HTML".

### Tab C: Social Media (LinkedIn/Twitter)
*   **View**:
    *   **LinkedIn**: Text area with emojis and hashtags.
    *   **Twitter**: Visual thread representation.
*   **User Actions**:
    *   Click "Copy to Clipboard".

## 7. Error States (Global)
*   **Upload Fail**: Toast message "Upload failed. Please try again."
*   **Transcription Fail**: "Could not transcribe audio. Please verify source audio quality."
*   **Processing Timeout**: "This video is taking longer than expected. We'll email you when it's done."
