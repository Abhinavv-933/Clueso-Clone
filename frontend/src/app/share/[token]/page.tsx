"use client";

import React, { useEffect, useState, use } from "react";
import { resolveSharedMedia, SharedMediaResponse } from "@/services/uploadService";
import { logger } from "@/config/env";

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [media, setMedia] = useState<SharedMediaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMedia() {
            try {
                setLoading(true);
                const data = await resolveSharedMedia(token);
                setMedia(data);
            } catch (err: any) {
                logger.error("Failed to resolve share token:", err);
                setError(err.message || "Something went wrong while loading this file.");
            } finally {
                setLoading(false);
            }
        }
        fetchMedia();
    }, [token]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Opening Secure Link...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
                <div className="text-6xl mb-6">🚫</div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">Access Denied</h1>
                <p className="text-gray-500 max-w-sm mb-8">{error}</p>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">Powered by Clueso Clone</div>
            </div>
        );
    }

    const isImage = media?.fileType.startsWith("image/");
    const isVideo = media?.fileType.startsWith("video/");

    return (
        <div className="flex flex-col min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <header className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 text-left">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-xs font-black text-white/80">C</div>
                    <h1 className="font-bold truncate text-sm text-white/90">{media?.fileName}</h1>
                </div>
                <a
                    href={media?.mediaUrl}
                    download={media?.fileName}
                    className="flex-shrink-0 bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-colors border border-white/5"
                    title="Download File"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </a>
            </header>

            {/* Media Content */}
            <main className="flex-1 relative flex items-center justify-center overflow-hidden p-4 sm:p-8">
                {isImage ? (
                    <img
                        src={media?.mediaUrl}
                        alt={media?.fileName}
                        className="max-w-full max-h-full object-contain select-none shadow-2xl rounded-lg"
                    />
                ) : isVideo ? (
                    <video
                        src={media?.mediaUrl}
                        controls
                        autoPlay
                        className="max-w-full max-h-full shadow-2xl rounded-lg"
                    />
                ) : (
                    <div className="text-center space-y-6">
                        <div className="text-7xl">📄</div>
                        <div className="space-y-1">
                            <p className="font-black text-xl uppercase tracking-tighter">Preview Unavailable</p>
                            <p className="text-white/40 text-sm">This file type must be downloaded to view.</p>
                        </div>
                        <a
                            href={media?.mediaUrl}
                            download={media?.fileName}
                            className="inline-block px-8 py-3 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl hover:bg-slate-200 active:scale-95"
                        >
                            Download File
                        </a>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="p-6 text-center border-t border-white/10 bg-black/40">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                    End-to-End Encrypted Sharing • Powered by <span className="text-white/40">Clueso Clone</span>
                </div>
            </footer>
        </div>
    );
}
