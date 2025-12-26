# Processing Pipeline

This document details the step-by-step journey media takes through our system to become a polished final product.

## 1. Video Input
**What happens**: The system accepts a raw video file from the user's upload or a YouTube link.
**Why it exists**: This is the raw material. Without source footage, there is nothing to process.
**What is produced**: A validated, accessible video file stored securely in the cloud.

## 2. Audio Extraction
**What happens**: The system isolates the sound track from the video file.
**Why it exists**: Transcription AI only needs audio. Processing a small audio file is much faster and cheaper than processing a massive video file.
**What is produced**: A clean MP3 or WAV audio file.

### Audio Extraction Stage
In this technical stage, the backend performs a series of atomic operations to prepare the media for AI transcription:

- **Why separate extraction**: By isolating the audio, we reduce the data payload sent to AI services (like Whisper) by up to 95%. It also allows us to normalize the audio format (sample rate, bit depth) for optimal transcription accuracy.
- **FFmpeg Usage**: We use FFmpeg via a system-level invocation because of its unparalleled performance and reliability in media transcoding. It allows for precise control over audio codecs and sample rates without the overhead of heavy Node.js libraries.
- **S3 Interaction Workflow**:
    1. **Download**: The worker fetches the original video from S3 to a local `temp/` directory.
    2. **Process**: FFmpeg extracts the audio, transcoding it to a 16kHz Mono WAV file (optimized for Whisper).
    3. **Upload**: The resulting `.wav` file is uploaded back to S3 under `clueso/audio/{userId}/{jobId}.wav`.
    4. **Cleanup**: Both the local video and audio files are immediately deleted to ensure disk space is managed efficiently.
- **Stage Output**: A persisted, normalized audio artifact in S3 and an updated job state of `AUDIO_EXTRACTED`.

## 3. Transcription
**What happens**: An AI service listens to the extracted audio and types out every word said, identifying who said what (diarization).
**Why it exists**: We need to turn unstructured audio into structured text that computers can understand and manipulate.
**What is produced**: A raw text transcript with timestamps for every word.

### Transcription Stage (Local Whisper Integration)
In this stage, the system converts the extracted audio into a structured JSON transcript using a local instance of OpenAI's Whisper model.

- **Order of Operations**: Transcription occurs strictly after audio extraction. This ensures the AI model only processes relevant audio data, significantly reducing the computational load and improving the signal-to-noise ratio by using normalized mono audio.
- **Why Local Whisper**:
    - **Cost**: Local execution is free, avoiding per-minute API costs from external providers.
    - **Privacy**: No audio data leaves the local server environment, ensuring maximum user data privacy.
    - **Performance**: High-throughput processing without being subject to external API rate limits or network latency.
- **Technological Choice (Node.js & Python)**: Node.js orchestrates the pipeline, but we spawn a dedicated Python process (using `py -3.11`) to execute the Whisper model. This leverages Python's superior ecosystem for machine learning and GPU acceleration while keeping the core application logic in TypeScript.
- **Data Flow**:
    1. **Download**: The transcription worker downloads the `.wav` file from S3 to a local `temp/` path.
    2. **Transcribe**: The worker spawns a Python script that loads the Whisper model and processes the audio file.
    3. **JSON Output**: The script produces a structured JSON output (containing text and segments) which is captured by the worker.
    4. **Artifact Upload**: The transcript JSON is saved locally and then uploaded to S3: `clueso/transcripts/{userId}/{jobId}.json`.
    5. **Cleanup**: Both the local `.wav` and `.json` files are deleted after a successful upload.
- **Stage Output**: A persisted JSON transcript artifact in S3 and an updated job state of `TRANSCRIBED`.

## 4. AI Transcript Improvement
**What happens**: A Large Language Model (LLM) reads the raw transcript. It fixes removed "ums" and "ahs," corrects grammar, breaks text into logical paragraphs, and generates a polished script.
**Why it exists**: Raw speech is often messy. To create professional content, we need to refine the spoken word into written standards.
**What is produced**: A clean, professional script or article ready for use.

### Script Improvement Stage (Local LLM with Ollama)
In this stage, the system leverages a local instance of the `llama3` model (via Ollama) to transform raw transcribed text into high-quality, readable scripts.

- **Purpose of Improvement**:
    - **Filler Word Removal**: Automatically strips out "uh", "um", "you know", etc., that clutter spontaneous speech.
    - **Clarity and Flow**: Polishes sentence structure and fixes minor grammatical errors without altering the speaker's intent.
    - **Consistency**: Ensures the tone remains professional while keeping technical terminology intact.
- **Why Local LLM (Ollama)**:
    - **Cost Efficiency**: Zero per-token costs compared to OpenAI or Anthropic APIs, allowing for unlimited iterations on long transcripts.
    - **Data Sovereignty**: The transcript never leaves the local infrastructure, ensuring user data privacy.
    - **Low Latency**: Direct communication with the local Ollama daemon avoids internet round-trips.
- **Processing Workflow (Chunking)**:
    - **Context Awareness**: To handle long transcripts efficiently and stay within model context limits, the worker splits segments into batches of 5–10.
    - **Prompt Engineering**: Uses structured JSON prompts to ensure the LLM returns an array of improvements that map exactly back to the original timestamps.
- **Data Integrity**: The process is strictly additive or subtractive regarding style; it is prohibited from adding "hallucinated" information. Every improved segment retains its original `startTime` and `endTime` from the Whisper transcription.
- **Stage Output**: A persisted `ImprovedScript` JSON artifact in S3 (`clueso/scripts/{userId}/{jobId}.json`) and an updated job state of `SCRIPT_IMPROVED`.

## 5. AI Voiceover (Optional)
**What happens**: If the user wants to replace the original audio, a Text-to-Speech engine generates a new, high-quality voice track from the improved script.
**Why it exists**: To fix mistakes in the original recording or to give the video a more professional "narrator" fee without re-recording.
**What is produced**: A new, perfectly timed audio track.

## 6. Final Video Generation
**What happens**: The system stitches everything back together. It combines the original video visuals (or selected clips) with the new voiceover (or original audio) and potentially adds subtitles or overlay text.
**Why it exists**: To deliver the final, consumable asset that the user can publish.
**What is produced**: A finalized .MP4 video file ready for download or sharing.
