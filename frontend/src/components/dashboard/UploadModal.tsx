"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, FileVideo, Video } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useProjects } from "@/context/ProjectContext";
import { API_URL } from "@/lib/api";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const router = useRouter();
    const { getToken } = useAuth();
    const { createProject } = useProjects();

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const token = await getToken();
            const apiUrl = API_URL;

            // 1. Get Presigned URL
            console.log(`[UploadModal] Getting presigned URL from: ${apiUrl}/uploads/presigned-url`);
            console.log(`[UploadModal] Request body:`, {
                filename: file.name,
                contentType: file.type,
                fileSize: file.size,
            });

            const presignRes = await fetch(`${apiUrl}/uploads/presigned-url`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                    fileSize: file.size,
                }),
            });

            console.log(`[UploadModal] Presigned URL response status:`, presignRes.status);

            if (!presignRes.ok) {
                // Log the actual error response
                const errorText = await presignRes.text();
                console.error(`[UploadModal] Failed to get upload URL. Status: ${presignRes.status}`);
                console.error(`[UploadModal] Error response:`, errorText);

                let errorMessage = "Failed to get upload URL";
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    // If not JSON, use the text
                    errorMessage = errorText || errorMessage;
                }

                throw new Error(`${errorMessage} (Status: ${presignRes.status})`);
            }

            const { uploadUrl, s3Key } = await presignRes.json();
            console.log(`[UploadModal] Got presigned URL successfully. S3 Key:`, s3Key);

            // 2. Upload to S3
            console.log(`[UploadModal] Uploading to S3...`);
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!uploadRes.ok) {
                console.error(`[UploadModal] S3 upload failed. Status:`, uploadRes.status);
                throw new Error(`Failed to upload to S3 (Status: ${uploadRes.status})`);
            }

            console.log(`[UploadModal] S3 upload successful`);

            // 2.5 Save Metadata to get uploadId
            const metadataRes = await fetch(`${apiUrl}/uploads/metadata`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fileKey: s3Key,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                }),
            });

            if (!metadataRes.ok) {
                throw new Error("Failed to save upload metadata");
            }
            const uploadData = await metadataRes.json();
            const uploadId = uploadData._id; // Get the ID from backend

            // 3. Create Project
            console.log(`[UploadModal] Creating project with uploadId:`, uploadId);
            const projectId = await createProject(file.name, s3Key, uploadId);
            console.log(`[UploadModal] Project created:`, projectId);

            onClose();
            // Reset state
            setFile(null);
            setUploadProgress(0);

            // Redirect to Project Page
            router.push(`/projects/${projectId}`);
        } catch (error) {
            console.error("[UploadModal] Upload failed:", error);
            // Show error toast
            alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#161622] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h3 className="text-lg font-semibold text-white">Upload Video</h3>
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {!file ? (
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer bg-white/5 hover:bg-white/10"
                        >
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="video-upload"
                            />
                            <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-white font-medium mb-1">Click to upload</span>
                                <span className="text-xs text-gray-400">or drag and drop MP4, WebM</span>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Video className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                    <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                                {!isUploading && (
                                    <button
                                        onClick={() => setFile(null)}
                                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {isUploading && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Uploading...</span>
                                        {/* Progress isn't tracked in fetch easily without XHR, so generic loader for now */}
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 animate-pulse w-full rounded-full" />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? "Uploading..." : "Upload Video"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

