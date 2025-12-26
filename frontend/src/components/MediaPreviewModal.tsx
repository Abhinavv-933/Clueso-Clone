"use client";

import React, { useEffect } from "react";

interface MediaPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
    type: string;
}

/**
 * MediaPreviewModal Component
 * 
 * A Clueso-style immersive focus view for videos and images.
 * Features a high-contrast dark backdrop, minimalist controls, and ESC-to-close behavior.
 */
export default function MediaPreviewModal({
    isOpen,
    onClose,
    title,
    url,
    type,
}: MediaPreviewModalProps) {
    // Handle ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden"; // Prevent scrolling
        }
        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isImage = type.startsWith("image/");
    const isVideo = type.startsWith("video/");

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
        >
            {/* Immersive Dark Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-zoom-out"
                onClick={onClose}
            />

            {/* Floating Close Button */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-all hover:rotate-90 duration-300 group"
                aria-label="Close preview"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Focus Content Container */}
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 md:p-20 z-[105] pointer-events-none">
                <div className="w-full max-w-6xl h-full flex items-center justify-center animate-in zoom-in-95 duration-500 pointer-events-auto">
                    {isImage ? (
                        <div className="relative group shrink-0">
                            <img
                                src={url}
                                alt={title}
                                className="max-w-full max-h-[85vh] object-contain select-none rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10"
                            />
                            {/* Simple Title Overlay on Hover */}
                            <div className="absolute -bottom-10 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{title}</span>
                            </div>
                        </div>
                    ) : isVideo ? (
                        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5">
                            <video
                                src={url}
                                controls
                                autoPlay
                                className="w-full h-full"
                            />
                        </div>
                    ) : (
                        <div className="text-center text-white space-y-8 max-w-sm">
                            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-5xl mx-auto border border-white/10">📄</div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black tracking-tight">{title}</h3>
                                <p className="text-white/40 font-medium text-sm">Preview functionality is reserved for images and videos.</p>
                            </div>
                            <a
                                href={url}
                                download
                                className="inline-flex px-8 py-3 bg-white text-black rounded-2xl font-black text-sm hover:bg-gray-200 transition-colors shadow-xl"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Download Original File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
