# System Dependencies

## FFmpeg (Required)
The backend processing pipeline requires **FFmpeg** to be installed and available in the system PATH. This is not an NPM package; it is a system binary.

### Why it is needed
We use FFmpeg to:
- Extract audio tracks from uploaded video files (MP4 -> MP3/WAV).
- Merge generated AI voiceovers with video.
- Probe media files for metadata (duration, format).

### Validation
To verify if FFmpeg is correctly installed, run the following command in your terminal:
```bash
ffmpeg -version
```

### Installation
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) or `winget install start_ffmpeg`. Add to PATH environment variable.
- **Mac**: `brew install ffmpeg`
- **Linux**: `apt-get install ffmpeg`

> **Note**: Without this binary, the `EXTRACTING_AUDIO` stage of the pipeline will fail.
