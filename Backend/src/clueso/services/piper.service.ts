import { spawn } from 'child_process';
import path from 'path';

/**
 * Service for interacting with Piper TTS.
 * Handles path resolution and process management for voice generation.
 */
export class PiperService {
    // Relative to the Backend directory (which is where process.cwd() should be)
    private static readonly PIPER_ROOT = path.resolve(process.cwd(), 'tools', 'piper');
    private static readonly PIPER_EXE = path.resolve(this.PIPER_ROOT, 'piper.exe');
    private static readonly MODELS_DIR = path.resolve(this.PIPER_ROOT, 'models');
    private static readonly DEFAULT_MODEL = path.resolve(this.MODELS_DIR, 'en_US-lessac-medium.onnx');

    /**
     * Generates a WAV file from the provided text using Piper TTS.
     * 
     * @param text - The text to convert to speech.
     * @param outputWavPath - Absolute path where the .wav file should be saved.
     * @returns Promise that resolves when the file is generated.
     */
    static async generateVoice(text: string, outputWavPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log(`[PiperService] Generating voice for text: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
            console.log(`[PiperService] Output path: ${outputWavPath}`);

            // Ensure we use the correct binary path for Windows/PowerShell compatibility
            // The prompt requested ".\\piper.exe" compatibility logic
            const piperPath = process.platform === 'win32' ? `.\\piper.exe` : './piper';

            const args = [
                '--model', this.DEFAULT_MODEL,
                '--output_file', outputWavPath
            ];

            // Execute piper.exe from its root directory to ensure DLLs are found
            const piperProcess = spawn(piperPath, args, {
                cwd: this.PIPER_ROOT,
                shell: true // Required for PowerShell/CMD execution of .\\piper.exe
            });

            // Pipe text to stdin
            piperProcess.stdin.write(text);
            piperProcess.stdin.end();

            let stderrData = '';

            piperProcess.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            piperProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`[PiperService] Successfully generated voice at: ${outputWavPath}`);
                    resolve();
                } else {
                    console.error(`[PiperService] Piper process exited with code ${code}`);
                    console.error(`[PiperService] Stderr: ${stderrData}`);
                    reject(new Error(`Piper TTS failed with exit code ${code}. Stderr: ${stderrData}`));
                }
            });

            piperProcess.on('error', (err) => {
                console.error(`[PiperService] Failed to start Piper process:`, err);
                reject(new Error(`Failed to start Piper process: ${err.message}`));
            });
        });
    }
}
