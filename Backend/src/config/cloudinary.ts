import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import './env'; // ensures dotenv.config() has run before we read process.env.CLOUDINARY_URL below

// Parse CLOUDINARY_URL ourselves instead of relying on the SDK's env auto-detection.
// Passing a partial object to cloudinary.config() can skip/override the automatic
// CLOUDINARY_URL parsing (symptom: cloud_name resolves as undefined even though the
// env var is set). Explicit parsing makes config deterministic regardless of SDK
// version or import order.
// Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (!cloudinaryUrl) {
    throw new Error('[cloudinary] CLOUDINARY_URL is not set. Add it to .env (local) or the Render dashboard (production).');
}

let parsed: URL;
try {
    parsed = new URL(cloudinaryUrl);
} catch {
    throw new Error('[cloudinary] CLOUDINARY_URL is not a valid URL. Expected format: cloudinary://<api_key>:<api_secret>@<cloud_name>');
}

if (parsed.protocol !== 'cloudinary:' || !parsed.hostname || !parsed.username || !parsed.password) {
    throw new Error('[cloudinary] CLOUDINARY_URL is malformed. Expected format: cloudinary://<api_key>:<api_secret>@<cloud_name>');
}

// Cloudinary accounts created since 2024 require SHA-256 request signing; the SDK
// still defaults to SHA-1 unless told otherwise, which produces a 401 "Invalid Signature"
// on every signed upload/delivery call without ever surfacing a useful client-side error.
cloudinary.config({
    cloud_name: parsed.hostname,
    api_key: parsed.username,
    api_secret: decodeURIComponent(parsed.password),
    secure: true,
    signature_algorithm: 'sha256',
});

console.log(`[cloudinary] Resolved cloud_name: ${cloudinary.config().cloud_name || 'MISSING'}`);
console.log(`[cloudinary] Resolved api_key: ${cloudinary.config().api_key ? 'present' : 'MISSING'}`);

export { cloudinary };

export type CloudinaryResourceType = 'image' | 'video' | 'raw';


export const getResourceTypeForMime = (mimeType: string): CloudinaryResourceType => {
    if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    return 'raw';
};


export const uploadFileToCloudinary = async (
    localPath: string,
    publicId: string,
    resourceType: CloudinaryResourceType
): Promise<{ publicId: string; secureUrl: string }> => {
    const result = await cloudinary.uploader.upload(localPath, {
        public_id: publicId,
        resource_type: resourceType,
        type: 'authenticated',
        overwrite: true,
    });
    return { publicId: result.public_id, secureUrl: result.secure_url };
};

export const uploadContentToCloudinary = async (
    content: string,
    publicId: string
): Promise<{ publicId: string; secureUrl: string }> => {
    const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { public_id: publicId, resource_type: 'raw', type: 'authenticated', overwrite: true },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        uploadStream.end(Buffer.from(content, 'utf-8'));
    });
    return { publicId: result.public_id, secureUrl: result.secure_url };
};


export const downloadFileFromCloudinary = async (
    publicId: string,
    resourceType: CloudinaryResourceType,
    localPath: string
): Promise<void> => {
    const url = getSignedDeliveryUrl(publicId, resourceType);

    const response = await fetch(url);
    if (!response.ok || !response.body) {
        throw new Error(`Failed to download Cloudinary asset ${publicId}: ${response.status}`);
    }

    const writeStream = fs.createWriteStream(localPath);
    await pipeline(response.body, writeStream);
};


export const downloadTextFromCloudinary = async (
    publicId: string,
    resourceType: CloudinaryResourceType
): Promise<string> => {
    const url = getSignedDeliveryUrl(publicId, resourceType);

    const response = await fetch(url);
    if (!response.ok) {
        const error = new Error(`Failed to download Cloudinary asset ${publicId}: ${response.status}`) as Error & { status?: number };
        error.status = response.status;
        throw error;
    }
    return await response.text();
};


// Signed delivery URL for `type: 'authenticated'` assets.
// NOTE: deliberately no `expires_at` here — time-limited URLs (`__cld_token__`)
// require Cloudinary's paid Media Authentication add-on. Plain `sign_url: true`
// embeds a signature in the URL path and works on the free tier.
export const getSignedDeliveryUrl = (
    publicId: string,
    resourceType: CloudinaryResourceType
): string => {
    return cloudinary.url(publicId, {
        resource_type: resourceType,
        type: 'authenticated',
        sign_url: true,
        secure: true,
    });
};


export const getSignedUploadParams = (publicId: string) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
        timestamp,
        public_id: publicId,
        type: 'authenticated',
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret!);
    const cloudName = cloudinary.config().cloud_name;

    return {
        timestamp,
        signature,
        apiKey: cloudinary.config().api_key,
        cloudName,
        publicId,
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    };
};