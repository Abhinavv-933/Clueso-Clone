"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { listUserUploads, IUpload, getDownloadUrl, createShareLink } from "@/services/uploadService";
import { logger } from "@/config/env";
import MediaPreviewModal from "./MediaPreviewModal";

export default function UploadedMediaList({ refreshKey = 0 }: { refreshKey?: number }) {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [uploads, setUploads] = useState<IUpload[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [previewItem, setPreviewItem] = useState<{ url: string; title: string; type: string } | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    // Share & Toast state
    const [sharingId, setSharingId] = useState<string | null>(null);
    const [selectedExpiry, setSelectedExpiry] = useState<string>("24h");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const fetchUploads = useCallback(async () => {
        if (!isLoaded || !isSignedIn) return;

        try {
            setLoading(true);
            const token = await getToken();
            if (!token) throw new Error("No auth token");

            const data = await listUserUploads(token);
            setUploads(data);
            setError(null);
        } catch (err: any) {
            logger.error("Failed to fetch uploads:", err);
            setError("Could not load your uploads. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [getToken, isLoaded, isSignedIn]);

    const handlePreviewClick = async (upload: IUpload) => {
        if (!isLoaded || !isSignedIn || isPreviewLoading) return;

        try {
            setIsPreviewLoading(true);
            const token = await getToken();
            if (!token) throw new Error("No token");

            const url = await getDownloadUrl(upload.fileKey, token);
            setPreviewItem({
                url,
                title: upload.fileName,
                type: upload.fileType
            });
        } catch (err: any) {
            logger.error("Preview failed:", err);
            alert("Failed to load preview. Please try again.");
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleShareClick = async (e: React.MouseEvent, upload: IUpload) => {
        e.stopPropagation(); // Don't trigger preview
        if (!isLoaded || !isSignedIn || sharingId) return;

        try {
            setSharingId(upload._id);
            const token = await getToken();
            if (!token) throw new Error("No token");

            const { shareUrl } = await createShareLink(upload._id, token, selectedExpiry);
            await navigator.clipboard.writeText(shareUrl);

            setToast({ message: `Share link (${selectedExpiry}) copied!`, type: "success" });
            setTimeout(() => setToast(null), 3000);
        } catch (err: any) {
            logger.error("Sharing failed:", err);
            setToast({ message: "Failed to generate share link", type: "error" });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setSharingId(null);
        }
    };

    useEffect(() => {
        fetchUploads();
    }, [fetchUploads, refreshKey]);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const isImage = (mimeType: string) => mimeType.startsWith("image/");
    const isVideo = (mimeType: string) => mimeType.startsWith("video/");

    // --- UI PARTIALS ---

    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mx-auto py-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4 animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded-2xl w-full"></div>
                    <div className="space-y-2 px-1">
                        <div className="h-4 w-3/4 bg-gray-200 rounded-md"></div>
                        <div className="h-3 w-1/2 bg-gray-100 rounded-md"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading) return <SkeletonLoader />;

    if (error) {
        return (
            <div className="max-w-xl mx-auto p-12 bg-white rounded-3xl border border-red-50 text-center shadow-sm">
                <div className="text-4xl mb-4">📡</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Sync Interrupted</h3>
                <p className="text-gray-500 mb-8 font-medium">{error}</p>
                <button
                    onClick={() => fetchUploads()}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    FORCE RETRY
                </button>
            </div>
        );
    }

    if (uploads.length === 0) {
        return (
            <div className="text-center py-24 px-12 border-2 border-dashed border-slate-200 rounded-[40px] bg-white max-w-2xl mx-auto shadow-sm/30">
                <div className="mb-6 inline-flex w-24 h-24 bg-slate-50 rounded-[32px] items-center justify-center text-4xl grayscale opacity-40 border border-slate-100">📂</div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Vault Empty</h3>
                <p className="text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">
                    Your secure media corridor is ready for deployment. Upload your first asset to begin tracking.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto w-full py-6">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 px-2 lg:px-4 gap-6">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight underline decoration-slate-200 decoration-4 underline-offset-8">Library</h3>
                    <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.2em]">
                        {uploads.length} Secured Units
                    </p>
                </div>

                {/* Global Share Settings */}
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm/50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-3 pr-1">Link Expiry</span>
                    <div className="flex gap-1">
                        {["1h", "24h", "7d"].map((duration) => (
                            <button
                                key={duration}
                                onClick={() => setSelectedExpiry(duration)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${selectedExpiry === duration
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {duration}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-10 px-2 lg:px-4">
                {uploads.map((upload) => (
                    <article
                        key={upload._id}
                        className="group relative flex flex-col cursor-pointer"
                        onClick={() => handlePreviewClick(upload)}
                    >
                        {/* Thumbnail Wrap */}
                        <div className="relative aspect-video rounded-2xl bg-muted border border-gray-100 overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-clueso-pink/5 group-hover:-translate-y-1">
                            {/* Static Placeholder / Background */}
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 group-hover:opacity-40">
                                {isImage(upload.fileType) ? (
                                    <div className="w-full h-full bg-clueso-pink/5 flex items-center justify-center text-clueso-pink/30">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-foreground flex items-center justify-center text-white/10">
                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                                    </div>
                                )}
                            </div>

                            {/* Hover Overlay: Play Button */}
                            <div className="absolute inset-0 bg-clueso-pink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="w-14 h-14 bg-white shadow-xl rounded-full flex items-center justify-center text-clueso-pink transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                                </div>
                            </div>

                            {/* Hover Overlay: Action Buttons */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <button
                                    onClick={(e) => handleShareClick(e, upload)}
                                    disabled={sharingId === upload._id}
                                    className="p-2.5 bg-white shadow-lg rounded-xl text-gray-700 hover:text-clueso-pink hover:scale-110 active:scale-95 transition-all outline-none"
                                    title="Share Link"
                                >
                                    {sharingId === upload._id ? (
                                        <div className="w-4 h-4 border-2 border-clueso-pink border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 12.684a3 3 0 100-2.684 3 3 0 000 2.684z"></path></svg>
                                    )}
                                </button>
                            </div>

                            {/* Badge */}
                            <div className="absolute bottom-3 left-3">
                                <span className="px-2 py-0.5 bg-white/90 backdrop-blur text-[10px] font-bold text-gray-900 rounded-md border border-gray-100 uppercase tracking-widest shadow-sm">
                                    {isVideo(upload.fileType) ? "Video" : "Image"}
                                </span>
                            </div>
                        </div>

                        {/* Metadata Block */}
                        <div className="mt-4 px-1">
                            <h4 className="text-sm font-bold text-gray-900 truncate mb-1 group-hover:text-clueso-pink transition-colors">
                                {upload.fileName}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                                <span>{formatFileSize(upload.fileSize)}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                <span>{new Date(upload.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Modals & Toasts */}
            {previewItem && (
                <MediaPreviewModal
                    isOpen={!!previewItem}
                    onClose={() => setPreviewItem(null)}
                    title={previewItem.title}
                    url={previewItem.url}
                    type={previewItem.type}
                />
            )}

            {toast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-500">
                    <div className={`px-8 py-3.5 rounded-full shadow-2xl flex items-center gap-4 border ${toast.type === "success"
                        ? "bg-foreground border-white/10 text-white"
                        : "bg-red-600 border-red-500/30 text-white"
                        }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${toast.type === "success" ? "bg-clueso-pink" : "bg-white/20"}`}>
                            {toast.type === "success" ? (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            )}
                        </div>
                        <span className="text-sm font-bold tracking-tight">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
