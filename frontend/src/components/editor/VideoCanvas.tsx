import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize2, Layers, Plus, ChevronDown, Scissors, Undo2, Redo2, ZoomIn, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoCanvasProps {
    videoUrl?: string;
    isPlaying: boolean;
    onTogglePlay: () => void;
    aspectRatio?: '16:9' | '9:16' | '1:1';
}

export function VideoCanvas({
    videoUrl,
    isPlaying,
    onTogglePlay,
    aspectRatio = '16:9'
}: VideoCanvasProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Sync isPlaying prop with native video element
    useEffect(() => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.play().catch(err => {
                if (err.name !== 'AbortError') {
                    console.warn("Video playback failed/interrupted:", err);
                }
            });
        } else {
            videoRef.current.pause();
        }
    }, [isPlaying]);

    const formatTime = (time: number) => {
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = Math.floor(time % 60);
        return `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center min-h-0">


            {/* Video Canvas with Frame - flex-1 to take available space */}
            <div className="flex-1 w-full flex items-center justify-center min-h-0 px-4">
                <div
                    className="relative bg-white p-3 rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
                    style={{
                        width: '1920px',
                        height: '1080px',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        aspectRatio: '16/9'
                    }}
                >
                    {/* Dotted Selection Border */}
                    <div className="absolute -inset-[3px] border-[2.5px] border-dashed border-pink-500/50 rounded-[20px] pointer-events-none" />

                    <div className="w-full h-full bg-[#12121e] rounded-xl overflow-hidden relative">
                        {videoUrl ? (
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                className="w-full h-full object-contain"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                playsInline
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                <Layers className="w-12 h-12 text-white/10" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/20">Preview area</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Video Player Control Bar - matches reference design */}
            <div className="w-full flex items-center justify-center mt-3 shrink-0">
                <div
                    className="flex items-center gap-8 bg-black/90 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl px-6"
                    style={{ height: '56px', maxWidth: '100%' }}
                >
                    {/* Left Group: Split & Add Clip */}
                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                            title="Split clip at playhead"
                        >
                            <Scissors className="w-4 h-4" />
                            <span className="text-sm font-medium">Split</span>
                        </button>

                        <button
                            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                            title="Add new clip"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Clip</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-[1px] bg-white/10" />

                    {/* Center Group: Playback Controls */}
                    <div className="flex items-center gap-4">
                        {/* Jump Backward */}
                        <button
                            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                            title="Jump backward"
                            onClick={() => {
                                if (videoRef.current) {
                                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                                }
                            }}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                            </svg>
                        </button>

                        {/* Play/Pause Button */}
                        <button
                            onClick={onTogglePlay}
                            className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                            ) : (
                                <Play className="w-5 h-5 ml-0.5 fill-current" />
                            )}
                        </button>

                        {/* Jump Forward */}
                        <button
                            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                            title="Jump forward"
                            onClick={() => {
                                if (videoRef.current) {
                                    videoRef.current.currentTime = Math.min(
                                        videoRef.current.duration || 0,
                                        videoRef.current.currentTime + 10
                                    );
                                }
                            }}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 18h2V6h-2zm-2.5-6L5 6v12z" />
                            </svg>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-[1px] bg-white/10" />

                    {/* Time Display */}
                    <div className="flex items-center gap-2 font-mono text-sm font-medium">
                        <span className="text-white tabular-nums">{formatTime(currentTime)}</span>
                        <span className="text-white/30">/</span>
                        <span className="text-white/50 tabular-nums">{formatTime(duration || 0)}</span>
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-[1px] bg-white/10" />

                    {/* Right Group: Undo/Redo */}
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                            title="Undo"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                            title="Redo"
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
