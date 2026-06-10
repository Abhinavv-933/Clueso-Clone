export type JobStatus =
    | 'UPLOADED'
    | 'AUDIO_EXTRACTED'
    | 'TRANSCRIBING'
    | 'TRANSCRIBED'
    | 'SCRIPT_IMPROVED'
    | 'VOICE_GENERATED'
    | 'VIDEO_MERGED'
    | 'COMPLETED'
    | 'FAILED';
