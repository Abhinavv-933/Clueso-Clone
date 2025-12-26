# Clueso.io Clone - MVP Scope

## 1. True MVP Features

### Core Workflow
1.  **Input Mechanism**
    *   **MP4 Upload**: Drag-and-drop support for local video files (up to 500MB).
    *   **YouTube URL**: Direct import via YouTube link (Audio extraction).

2.  **Transcription Engine**
    *   **Speech-to-Text**: High-accuracy transcription (using Whisper or deepgram).
    *   **Speaker Diarization**: Separation of speakers (Speaker A, Speaker B) for podcast formats.
    *   **Transcript Viewer**: Read-only display of generated transcript with timestamps.

3.  **AI Content Repurposing (The Core Value)**
    *   **Blog Post Generator**: One-click generation of SEO-optimized articles based on the transcript.
    *   **Social Suite**:
        *   **LinkedIn Post**: Professional, structured summary.
        *   **Twitter Thread**: Hook-based thread broken into tweets.

4.  **Web Dashboard**
    *   **Project List**: Dashboard showing recent video projects and their status.
    *   **Project Detail**: Unified view containing the source video/audio player, transcript, and generated artifacts.
    *   **Export**: Copy-to-clipboard functionality for all generated text.

## 2. Intentionally Excluded from MVP

*   **Browser Extensions**: No Chrome extensions.
*   **Screen/Step Recording**: No "click-to-capture" step-by-step guide generation.
*   **Video Editing**: No trimming, cutting, or stitching capabilities.
*   **Video Hosting**: We are not a video hosting platform; videos are for internal processing only.
*   **Direct CMS Integration**: No direct publishing to WordPress, Medium, etc. (Copy/Paste only).
*   **Team Collaboration**: Single-user accounts only. No organizations or shared workspaces.

## 3. Measurable Success Criteria for MVP

*   **Speed**: End-to-end processing (Upload -> Transcript -> Blog) takes < 20% of the video's duration (e.g., 6 mins for a 30 min video).
*   **Quality**: Generated blog posts require < 2 minutes of human editing before publishing.
*   **Reliability**: 99% success rate for valid YouTube URLs.
*   **System Limits**: Capable of handling video files up to 60 minutes in length without timeout.
