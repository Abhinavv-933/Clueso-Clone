import { spawn } from 'child_process';
import path from 'path';

interface TranscribeInput {
    localAudioPath: string;
}

export const transcribeAudio = async ({ localAudioPath }: TranscribeInput): Promise<string> => {
    console.log(`[Worker] Starting local transcription for: ${localAudioPath}`);

    return new Promise((resolve, reject) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'whisper_transcribe.py');
        console.log(`[Worker] Executing script: python ${scriptPath} ${localAudioPath}`);

        const pythonProcess = spawn('python', [scriptPath, localAudioPath, 'base']);

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString('utf8');
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString('utf8');
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`[Worker] Local Whisper script failed with code ${code}`);
                console.error(`[Worker] stderr: ${stderrData}`);
                return reject(new Error(`Local transcription failed: ${stderrData || 'Unknown error'}`));
            }

            // Log detected language from stderr
            if (stderrData) {
                console.log(`[Worker] Whisper info: ${stderrData.trim()}`);
            }

            // Trim and validate transcript
            const transcript = stdoutData.trim();
            if (!transcript) {
                console.error(`[Worker] Transcription produced empty output`);
                return reject(new Error('Transcription produced empty output'));
            }

            console.log(`[Worker] Local Transcription complete. Length: ${transcript.length} chars`);
            resolve(transcript);
        });
    });
};
