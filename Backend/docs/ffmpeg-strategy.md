# FFmpeg Rendering Strategy

This document outlines the FFmpeg strategy for the `VIDEO_RENDERED` stage of the Clueso pipeline. The goal is to replace the original video's audio with the AI-generated voiceover.

## The Command

```bash
ffmpeg -y -i input_video.mp4 -i voiceover.wav \
  -map 0:v:0 \
  -map 1:a:0 \
  -c:v copy \
  -c:a aac \
  -shortest \
  output_video.mp4
```

### Parameter Breakdown

| Parameter | Explanation |
| :--- | :--- |
| `-y` | Automatically overwrite the output file if it exists. |
| `-i input_video.mp4` | The first input file (Index 0). |
| `-i voiceover.wav` | The second input file (Index 1). |
| `-map 0:v:0` | Selects the first video stream from the first input (Index 0). |
| `-map 1:a:0` | Selects the first audio stream from the second input (Index 1). This effectively ignores the audio from the original video. |
| `-c:v copy` | Copies the video stream without re-encoding. This is extremely fast and preserves the original video quality. |
| `-c:a aac` | Encodes the wav audio into AAC format, which is the standard for high compatibility within MP4 containers. |
| `-shortest` | Ensures the output file ends as soon as the shortest input stream (either video or audio) finishes. This prevents issues where a video might hang on the last frame if the audio is longer. |

## Why this strategy?

1. **Performance**: Using `-c:v copy` avoids the heavy CPU cost of re-encoding video, making the rendering process near-instant regardless of video length.
2. **Compatibility**: AAC in an MP4 container is the most widely supported format across browsers and mobile devices.
3. **Cleanliness**: By using `-map`, we explicitly define the source for each track, ensuring no stray audio from the original recording leaks into the final product.

## Cross-Platform Compatibility

- **Executables**: FFmpeg binaries should be resolved dynamically (e.g., using `fluent-ffmpeg` or simple path resolution) to ensure the service works on Windows (`ffmpeg.exe`) and Linux/macOS (`ffmpeg`).
- **Pathing**: Always use `path.resolve` for inputs and outputs to avoid shell interpolation issues across PowerShell and Bash.
- **Pipe Support**: While `spawn` is used for process management, the command structure remains identical across OSs as long as the FFmpeg version is modern (4.x+).
