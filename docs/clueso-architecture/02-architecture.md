# System Architecture

## Overall System Architecture
The system follows an asynchronous, event-driven architecture designed for reliability and scalability. Instead of processing heavy media files instantly during the user's request, the system accepts the input, acknowledges it, and then processes it in the background. This decoupling ensures the user interface remains responsive while heavy computational tasks (transcription, AI generation) happen independently.

## Post-Processing Pipeline vs. Real-Time Streaming
We chose a post-processing pipeline over real-time streaming for several key reasons:
1.  **Quality over Latency**: Our goal is high-accuracy transcription and polished content generation, which requires analyzing the full context of the media. Real-time streaming often trades accuracy for speed.
2.  **Resource Management**: Processing video is computationally expensive. A queue-based pipeline allows us to manage load effectively, preventing system crashes during traffic spikes.
3.  **User Experience**: Users typically upload a file and expect to return later for the results. They do not need to watch the transcription happen word-by-word. This allows for a "fire and forget" workflow.

## Major System Layers

### 1. Frontend Layer
This is the user's entry point. It handles:
-   User authentication and session management.
-   File uploads and input validation.
-   Displaying project status (processing, ready, failed).
-   Presenting the final transcripts and generated content for review and export.
It is purely a presentation layer and contains no business logic for media processing.

### 2. Backend API Layer
The API acts as the conductor. It:
-   Receives requests from the frontend.
-   Validates data and permissions.
-   Offloads heavy tasks to the Worker Layer by adding jobs to a queue.
-   Updates the database with the current status of projects.
It returns immediate responses to the frontend, confirming that a request has been received, without waiting for the processing to finish.

### 3. Worker Layer (Background Processing)
This is the engine room. Workers are separate processes that run completely independently of the API. They:
-   Pick up jobs from the queue.
-   Perform the heavy lifting: downloading files, running transcription algorithms, and querying AI models.
-   Update the database with results upon completion.
If a worker fails, the job can be retried without affecting the user's experience on the frontend.

### 4. Storage Layer
This layer persists all data. It is split into:
-   **File Storage**: Where raw video files and audio extracts are kept securely.
-   **Database**: Where metadata (project details, user info), transcripts, and generated text are stored in a structured format.

## Separation of Responsibilities
The system enforces a strict separation of concerns:
-   The **Frontend** never touches the database directly.
-   The **Backend API** never performs long-running calculations; it only delegates them.
-   The **Workers** do not handle HTTP requests; they only process background jobs.
-   The **Storage** is passive and only accessed by the API and Workers.

This separation ensures that a failure in one component (e.g., a transcription error) does not crash the entire application or freeze the user interface.

## Integration with Existing Upload & Auth System

### Reusing Clerk Authentication
We leverage the existing Clerk integration in the backend. Since Clueso runs within the same Express application, we do not need to build a new auth system. All Clueso endpoints are protected by the same `requireAuth()` middleware, ensuring that `{ req.auth.userId }` is always available and verified. This provides enterprise-grade security out of the box.

### Reusing Presigned S3 Uploads
Instead of building a custom upload flow, Clueso taps into the existing generic file upload system.
1.  **Frontend** uploads the file directly to S3 using a presigned URL (bypassing our server to save bandwidth).
2.  **Existing Backend** tracks this upload in the `Uploads` table.
3.  **Clueso** simply links to this existing `uploadId`.

### Why Link Instead of Re-Upload?
*   **Efficiency**: We don't move gigabytes of video data unnecessarily. We just pass a reference (the `uploadId` and `fileKey`).
*   **Security**: Files are already in a secure, private S3 bucket. Clueso workers use IAM roles or signed URLs to access them only when needed.
*   **Simplicity**: The frontend doesn't need to learn a "Clueso Upload" protocol. it just uploads a file as normal, then tells Clueso "Hey, I uploaded file X, please process it."
