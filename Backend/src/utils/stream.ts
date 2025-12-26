
import { Readable } from 'stream';

export const streamToString = (stream: Readable | ReadableStream | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (stream instanceof Readable) {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            stream.on('error', (err) => reject(err));
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        } else {
            // Basic fallback for other stream types if needed, though AWS SDK v3 usually returns a robust body
            // For Node.js runtime, AWS SDK .transformToString() on body is often available now, 
            // but if we are manually processing:
            reject(new Error("Unsupported stream type in streamToString"));
        }
    });
};
