import sys
import os
import json
try:
    import whisper
except ImportError:
    print("ERROR: Whisper dependency missing. Ensure openai-whisper is installed.", file=sys.stderr)
    sys.exit(1)
import warnings

# Suppress FP16 warning if running on CPU
warnings.filterwarnings("ignore")

# Ensure UTF-8 encoding for stdout
sys.stdout.reconfigure(encoding='utf-8')

def transcribe(audio_path, model_size="base"):
    """
    Transcribes an audio file using the open-source Whisper model.
    Detects language first, then transcribes with explicit language parameter.
    """
    if not os.path.exists(audio_path):
        print(json.dumps({"error": f"File not found: {audio_path}"}))
        sys.exit(1)

    try:
        # Load the model (tiny, base, small, medium, large)
        # We use 'base' for a good balance of speed and accuracy
        model = whisper.load_model(model_size)

        # Step 1: Detect language
        # Load audio and pad/trim it to fit 30 seconds
        audio = whisper.load_audio(audio_path)
        audio = whisper.pad_or_trim(audio)
        
        # Make log-Mel spectrogram and move to the same device as the model
        mel = whisper.log_mel_spectrogram(audio).to(model.device)
        
        # Detect the spoken language
        _, probs = model.detect_language(mel)
        detected_language = max(probs, key=probs.get)
        
        # Log detected language to stderr (won't pollute transcript output)
        print(f"Detected language: {detected_language}", file=sys.stderr)

        # Step 2: Perform transcription with explicit language parameter
        # Configure transcription parameters based on language
        transcribe_options = {
            'language': detected_language,
            'task': 'transcribe',  # Never translate, always transcribe
            'verbose': False,
            'fp16': False,  # Use FP32 for better accuracy
        }
        
        # Add Hindi-specific optimizations for better accuracy
        if detected_language == 'hi':
            print(f"Applying Hindi-specific configuration for improved accuracy", file=sys.stderr)
            transcribe_options['beam_size'] = 5  # More thorough beam search decoding
            transcribe_options['best_of'] = 5    # Consider more candidate sequences
            transcribe_options['temperature'] = 0.0  # Deterministic output (no sampling)
            transcribe_options['compression_ratio_threshold'] = 2.4
            transcribe_options['logprob_threshold'] = -1.0
            transcribe_options['no_speech_threshold'] = 0.6
        
        # This ensures Hindi is transcribed in Hindi, not translated to English
        result = model.transcribe(audio_path, **transcribe_options)

        # Output just the text (UTF-8 encoded)
        print(result["text"])

    except Exception as e:
        # Print error as text prefixed with ERROR:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python whisper_transcribe.py <audio_path> [model_size]"}))
        sys.exit(1)

    audio_file = sys.argv[1]
    size = sys.argv[2] if len(sys.argv) > 2 else "base"
    
    transcribe(audio_file, size)
