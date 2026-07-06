import axios from "axios";

/**
 * Service for handling file uploads to Cloudinary via signed direct uploads
 */

export interface SignedUploadParams {
    uploadUrl: string;
    publicId: string;
    timestamp: number;
    signature: string;
    apiKey: string;
    cloudName: string;
}

export interface IUpload {
    _id: string;
    fileKey: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: string;
    createdAt: string;
}

/**
 * Fetches signed Cloudinary upload params from the backend
 * @param fileName - Original name of the file
 * @param fileType - MIME type of the file
 * @param token - Optional Clerk session token for authentication
 */
export const getSignedUploadParams = async (
    fileName: string,
    fileType: string,
    fileSize: number,
    token?: string
): Promise<SignedUploadParams> => {
    const response = await fetch("/api/uploads/presigned-url", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            filename: fileName,
            contentType: fileType,
            fileSize: fileSize,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || `Failed to get upload params: ${response.statusText}`);
    }

    return await response.json();
};

/**
 * Uploads a file directly to Cloudinary using signed upload params, with progress tracking
 * @param params - The signed upload params provided by the backend
 * @param file - The File object to upload
 * @param onProgress - Optional callback for upload progress (0-100)
 */
export const uploadToCloudinary = async (
    params: SignedUploadParams,
    file: File,
    onProgress?: (progress: number) => void
): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("public_id", params.publicId);
    formData.append("timestamp", String(params.timestamp));
    formData.append("signature", params.signature);
    formData.append("api_key", params.apiKey);
    formData.append("type", "authenticated");

    await axios.post(params.uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
};

/**
 * Persists upload metadata to the backend after Cloudinary upload completion
 */
export interface UploadMetadata {
    fileKey: string;
    fileName: string;
    fileType: string;
    fileSize: number;
}

export const saveUploadMetadata = async (metadata: UploadMetadata, token: string) => {
    const response = await fetch("/api/uploads/metadata", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(metadata),
    });

    if (!response.ok) {
        throw new Error("Failed to save final metadata");
    }

    return await response.json();
};
/**
 * Fetches the list of uploads for the current user
 * @param token - Clerk session token
 */
export const listUserUploads = async (token: string): Promise<IUpload[]> => {
    const response = await fetch("/api/uploads", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch uploads");
    }

    return (await response.json()) as IUpload[];
};

/**
 * Fetches a signed download/preview URL for a specific fileKey
 */
export const getDownloadUrl = async (fileKey: string, token: string): Promise<string> => {
    // Keys often contain slashes/special chars, encode them
    const encodedKey = encodeURIComponent(fileKey);

    const response = await fetch(`/api/uploads/download/${encodedKey}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get preview link");
    }

    const data = await response.json();
    return data.downloadUrl;
};
/**
 * Creates a public share link for a specific uploadId
 */
export const createShareLink = async (uploadId: string, token: string, expiresIn?: string): Promise<{ token: string; shareUrl: string }> => {
    const response = await fetch("/api/uploads/share", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uploadId, expiresIn }),
    });

    if (!response.ok) {
        throw new Error("Failed to create share link");
    }

    return await response.json();
};

/**
 * Publicly resolves a share token to fetch media details
 */
export interface SharedMediaResponse {
    fileName: string;
    fileType: string;
    fileSize: number;
    mediaUrl: string;
}

export const resolveSharedMedia = async (token: string): Promise<SharedMediaResponse> => {
    const response = await fetch(`/api/uploads/share/${token}`, {
        method: "GET",
    });

    if (!response.ok) {
        if (response.status === 410) throw new Error("This share link has expired.");
        if (response.status === 404) throw new Error("Invalid or broken share link.");
        throw new Error("Failed to load shared media.");
    }

    return await response.json();
};
