import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import Groq from 'groq-sdk';
import {
    downloadFileFromCloudinary,
    CloudinaryResourceType,
} from '../../config/cloudinary';
import { env } from '../../config/env';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Groq's documented per-request file limit is 25MB on the free tier.
// We use a 24MB threshold to leave headroom for multipart overhead.
const GROQ_SIZE_LIMIT_BYTES = 24 * 1024 * 1024;

// Container/audio formats Groq's Whisper endpoint accepts directly —
// these can be sent as-is with no local processing.
const GROQ_ACCEPTED_EXTENSIONS = new Set([
    '.flac', '.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.ogg', '.wav', '.webm',
]);

// Resolution order: explicit FFMPEG_PATH override -> ffmpeg-static's bundled
// binary (works on Render, which has no system ffmpeg) -> bare 'ffmpeg' on PATH.
const resolveFfmpegBin = (): string => {
    if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;

    try {
        // ffmpeg-static has no bundled types; it resolves to an absolute binary
        // path (or null on unsupported platforms), so `require` typed as `any` here.
        const ffmpegStaticPath = require('ffmpeg-static');
        if (ffmpegStaticPath) return ffmpegStaticPath;
    } catch {
        // ffmpeg-static not installed — fall through to system PATH lookup
    }

    return 'ffmpeg';
};

const FFMPEG_BIN = resolveFfmpegBin();

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

// ---------------------------------------------------------------------------
// FFmpeg fallback: extract a minimal mono audio track
// ---------------------------------------------------------------------------

/**
 * Extracts the audio stream from a video file into a small mono MP3.
 * -vn        drop the video stream entirely
 * -ac 1      downmix to mono (speech doesn't need stereo)
 * -b:a 48k   48kbps is plenty for Whisper; ~0.35MB per minute
 * -y         overwrite output if it exists
 */
const extractAudio = (inputPath: string, outputPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const args = ['-i', inputPath, '-vn', '-ac', '1', '-b:a', '48k', '-y', outputPath];
        const proc = spawn(FFMPEG_BIN, args, { stdio: ['ignore', 'ignore', 'pipe'] });

        let stderr = '';
        proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

        proc.on('error', (err) => {
            reject(new Error(`[ffmpeg] failed to spawn (is FFmpeg installed / FFMPEG_PATH set?): ${err.message}`));
        });

        proc.on('close', (code) => {
            if (code === 0) return resolve();
            // Last few lines of stderr usually contain the actual error
            const tail = stderr.split('\n').slice(-6).join('\n');
            reject(new Error(`[ffmpeg] exited with code ${code}:\n${tail}`));
        });
    });
};

// ---------------------------------------------------------------------------
// Decision logic: direct-to-Groq vs extract-then-send
// ---------------------------------------------------------------------------

interface PreparedAudio {
    /** Path of the file that should be sent to Groq */
    filePath: string;
    /** Whether FFmpeg extraction was used (useful for logging/metrics) */
    extracted: boolean;
}

/**
 * Decides whether the downloaded file can go to Groq as-is, or needs
 * its audio extracted first. Returns the path to send to Groq.
 */
const prepareAudioForGroq = async (
    downloadedPath: string,
    workDir: string
): Promise<PreparedAudio> => {
    const { size } = await fs.promises.stat(downloadedPath);
    const ext = path.extname(downloadedPath).toLowerCase();

    const formatOk = GROQ_ACCEPTED_EXTENSIONS.has(ext);
    const sizeOk = size <= GROQ_SIZE_LIMIT_BYTES;

    if (formatOk && sizeOk) {
        console.log(`[transcribe] Sending directly to Groq (${(size / 1024 / 1024).toFixed(1)}MB, ${ext}) — no extraction needed`);
        return { filePath: downloadedPath, extracted: false };
    }

    const reason = !formatOk ? `format ${ext} not accepted` : `size ${(size / 1024 / 1024).toFixed(1)}MB exceeds limit`;
    console.log(`[transcribe] Falling back to FFmpeg extraction (${reason})`);

    const audioPath = path.join(workDir, 'audio.mp3');
    await extractAudio(downloadedPath, audioPath);

    const { size: audioSize } = await fs.promises.stat(audioPath);
    console.log(`[transcribe] Extracted audio: ${(audioSize / 1024 / 1024).toFixed(1)}MB`);

    if (audioSize > GROQ_SIZE_LIMIT_BYTES) {
        // Even the audio alone is too big (multi-hour recording).
        // Chunking is the future fix — fail clearly for now.
        throw new Error(
            `[transcribe] Extracted audio (${(audioSize / 1024 / 1024).toFixed(1)}MB) still exceeds Groq's limit. ` +
            `Chunked transcription not yet implemented.`
        );
    }

    return { filePath: audioPath, extracted: true };
};

// ---------------------------------------------------------------------------
// Main worker entry point
// ---------------------------------------------------------------------------

export interface TranscriptionResult {
    text: string;
    /** Word/segment timing data from Groq (verbose_json) — useful for your editor UI */
    segments?: unknown;
    usedFfmpeg: boolean;
}

/**
 * Full pipeline for one video:
 *   Cloudinary download -> (maybe) FFmpeg extraction -> Groq Whisper -> transcript
 *
 * Caller is responsible for MongoDB status updates around this
 * (set PROCESSING before calling, READY/FAILED after).
 */
export const transcribeVideo = async (
    publicId: string,
    resourceType: CloudinaryResourceType,
    originalExtension: string // e.g. ".mp4" — from the stored metadata, since publicId has no extension
): Promise<TranscriptionResult> => {
    // Isolated temp dir per job so parallel jobs never collide
    const workDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'transcribe-'));
    const downloadedPath = path.join(workDir, `input${originalExtension.toLowerCase()}`);

    try {
        console.log(`[transcribe] Downloading ${publicId} from Cloudinary...`);
        await downloadFileFromCloudinary(publicId, resourceType, downloadedPath);

        const { filePath, extracted } = await prepareAudioForGroq(downloadedPath, workDir);

        console.log('[transcribe] Calling Groq whisper-large-v3...');
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-large-v3',
            response_format: 'verbose_json', // includes segments with timestamps
        });

        return {
            text: transcription.text,
            segments: (transcription as any).segments,
            usedFfmpeg: extracted,
        };
    } finally {
        // Always clean up temp files, success or failure —
        // leaked temp files on Render's small disk add up fast
        await fs.promises.rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
};