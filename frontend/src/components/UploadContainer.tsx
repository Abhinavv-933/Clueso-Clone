"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import FileUpload from "./FileUpload";
import { getPresignedUrl, uploadToS3, saveUploadMetadata } from "@/services/uploadService";
import { logger, validateEnv } from "@/config/env";

// Run validation once on module load (client-side)
if (typeof window !== "undefined") {
    validateEnv();
}

/**
 * UploadContainer Component
 * 
 * Orchestrates the full S3 upload flow:
 * 1. File selection & local validation (via FileUpload)
 * 2. Authenticated request for a backend Presigned URL
 * 3. Direct PUT upload to S3 with real-time progress tracking
 * 4. Error recovery via Retry mechanism
 */
export default function UploadContainer({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
    const { getToken } = useAuth();

    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [uploadedKey, setUploadedKey] = useState<string | null>(null);

    /**
     * Resets selection states when a new file is picked
     */
    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setUploadedKey(null);
        setProgress(0);
    };

    /**
     * Primary upload handler implementing the multi-step S3 flow
     */
    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadedKey(null);
        setProgress(0);

        try {
            // Step 1: Securely fetch the session token from Clerk
            const token = await getToken();
            if (!token) throw new Error("Authentication failed. Please sign in again.");

            // Step 2: Request a temporary S3 write permission (Presigned URL)
            let presignedData;
            try {
                presignedData = await getPresignedUrl(
                    file.name,
                    file.type,
                    file.size,
                    token
                );
            } catch (err: any) {
                throw new Error(`Server error: ${err.message || "Could not prepare upload. Please try again later."}`);
            }

            const { uploadUrl, fileKey } = presignedData;

            // Step 3: Stream file bytes directly to S3 via PUT request
            try {
                await uploadToS3(uploadUrl, file, (p) => {
                    setProgress(p); // Update UI progress state
                });
            } catch (err: any) {
                throw new Error(`Upload failed: ${err.response?.status === 403 ? "Access denied" : "Network error or S3 interruption"}. Please check your connection and retry.`);
            }

            // Step 4: Finalize by saving metadata to backend
            try {
                await saveUploadMetadata({
                    fileKey,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                }, token);
            } catch (err: any) {
                throw new Error(`Finishing failed: ${err.message || "Metadata could not be saved."}`);
            }

            // Step 5: Finalize state
            setUploadedKey(fileKey);
            setFile(null);
            setProgress(100);

            // Signal success to parent if listener exists
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err: any) {
            logger.error("Robust upload error:", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
            setProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <main className="w-full max-w-lg mx-auto p-8 space-y-8 bg-white rounded-3xl shadow-xl shadow-clueso-pink/[0.03] border border-gray-100 transition-all">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight">Upload Media</h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">MP4, MOV, PNG OR JPG</p>
                </div>
                {isUploading && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-clueso-pink/10 border border-clueso-pink/20 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-clueso-pink animate-pulse"></div>
                        <span className="text-[10px] font-black text-clueso-pink uppercase tracking-tight">Processing</span>
                    </div>
                )}
            </header>

            <section aria-label="File selection area">
                <FileUpload
                    onFileSelect={handleFileSelect}
                    disabled={isUploading}
                />
            </section>

            {/* Progress & Actions Section */}
            <div className="space-y-6">
                {isUploading && (
                    <div className="space-y-3" aria-live="polite">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-gray-700">{progress < 100 ? "Uploading asset..." : "Finalizing..."}</span>
                            <span className="text-lg font-black text-clueso-pink tabular-nums">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-clueso-pink h-full transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                                role="progressbar"
                                aria-valuenow={progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>
                    </div>
                )}

                <footer className="flex flex-col gap-4">
                    {error ? (
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="w-full py-4 px-6 rounded-2xl font-black text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group"
                            aria-label="Retry failed upload"
                        >
                            <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            RETRY UPLOAD
                        </button>
                    ) : (
                        <button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className={`w-full py-4 px-6 rounded-2xl font-black text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${!file || isUploading
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                                : "bg-clueso-pink hover:scale-[1.02] shadow-clueso-pink/20 active:scale-[0.98]"
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-sm font-black uppercase tracking-tight">Processing...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    <span className="text-sm font-black uppercase tracking-tight">Upload Now</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Feedback Messages */}
                    <div aria-live="assertive">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-sm">
                                <div className="flex items-start gap-4">
                                    <span className="text-xl" role="img" aria-label="error">🚫</span>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Upload Interrupted</h4>
                                        <p className="text-xs text-red-700/80 leading-relaxed font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {uploadedKey && !isUploading && (
                            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-start gap-4">
                                    <span className="text-xl" role="img" aria-label="success">✨</span>
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Deployment Success</h4>
                                        <div className="bg-white/60 p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between group">
                                            <code className="text-[10px] font-mono text-emerald-800 truncate pr-4">
                                                {uploadedKey}
                                            </code>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(uploadedKey)}
                                                className="p-1 hover:bg-emerald-100 rounded transition-colors"
                                                title="Copy Key"
                                            >
                                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </footer>
            </div>

            <p className="text-[10px] text-gray-400 text-center font-bold tracking-widest uppercase py-2">
                Clueso Secure Upload Protocol
            </p>
        </main>
    );
}
