# Local Whisper Transcription

To avoid paid APIs and maintain data privacy, this system uses the open-source **OpenAI Whisper** model running locally.

## Architecture
The transcription is handled by a separate Python process invoked from Node.js via `child_process.spawn`. This isolates the heavy CPU/GPU workload of the AI model from the main API server.

## Requirements
To run transcription locally, the system must have:
1. **Python 3.8+**
2. **PyTorch**
3. **OpenAI Whisper Library**

### Installation
Run the following commands on the host machine:
```bash
# Install whisper and its dependencies
pip install -U openai-whisper
```
*Note: FFmpeg must also be installed (see system-dependencies.md).*

## Script Usage
The wrapper script is located at `backend/scripts/whisper_transcribe.py`.

**Manual Execution:**
```bash
python scripts/whisper_transcribe.py path/to/audio.wav [model_size]
```
- `model_size`: Optional. Can be `tiny`, `base`, `small`, `medium`, or `large`. Default is `base`.

## Output Format
The script returns a JSON object to stdout:
```json
{
  "text": "Full transcript text...",
  "segments": [
    {
      "start": 0.0,
      "end": 2.5,
      "text": "Hello world"
    }
  ]
}
```

## Scaling Considerations
Whisper is computationally intensive. In a production environment, this script should ideally run on a worker node equipped with a GPU. On a CPU, the `base` model is recommended for acceptable performance.
