# End-to-End Data Flow

This document traces the lifecycle of a video project from the moment a user interacts with the system to the delivery of the final content.

## 1. Input & Ingestion
The process begins when a user wants to create a new project.
1.  **User Action**: The user either drags and drops a video file onto the dashboard or pastes a YouTube URL.
2.  **Frontend Validation**: The browser checks basic validity (file size limits, URL format) before sending anything.
3.  **Secure Upload**:
    *   **File Uploads**: The frontend requests a temporary "signed URL" from the API. The browser then uploads the large video file directly to the secure Cloud Storage, bypassing the API server to save bandwidth.
    *   **YouTube Links**: The URL is sent directly to the API.
4.  **Project Creation**: The API creates a new database entry for the project with a status of `uploading` (for files) or `queued` (for links).

## 2. Queueing for Processing
Once the file is safely in storage or the link is received, the backend prepares it for processing.
5.  **Job Creation**: The API adds a specific "job" to the processing queue. This job contains the file location and project ID.
6.  **Status Update**: The project status in the database is updated to `processing`.
7.  **User Feedback**: The frontend sees this status change and displays a "Processing..." indicator to the user. The user can now safely leave the page.

## 3. Background Processing (The Worker)
A separate background worker picks up the job from the queue.
8.  **Job pickup**: An idle worker claims the job.
9.  **Audio Extraction**:
    *   **From File**: The worker downloads the video from Cloud Storage and extracts the audio track.
    *   **From YouTube**: The worker downloads the audio stream directly from the provided URL.
10. **Transcription**: The audio file is sent to the AI Transcription Service. The service returns a raw transcript with timestamps and speaker labels.
11. **Content Generation**: The worker takes the raw transcript and sends it to the AI Language Model with specific prompts (e.g., "Write a blog post based on this..."). The AI returns the structured text.

## 4. Completion & Delivery
The heavy lifting is done, and the results are saved.
12. **Saving Results**: The worker saves the transcript and the generated blog posts/social content into the database, linked to the project.
13. **Status Finalization**: The project status is updated to `completed`.
14. **Cleanup**: Temporary files (like the extracted audio) are deleted from the worker to free up space.
15. **User Notification**:
    *   If the user is still on the dashboard, the page automatically refreshes or updates to show the "Ready" status.
    *   The user can now click into the project to view the video, read the transcript, and copy the generated content.
