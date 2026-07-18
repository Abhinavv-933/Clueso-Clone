
import { Readable } from 'stream';

export const streamToString = (stream: Readable | ReadableStream | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (stream instanceof Readable) {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            stream.on('error', (err) => reject(err));
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        } else {
            reject(new Error("Unsupported stream type in streamToString"));
        }
    });
};
