import React from 'react';
import { Search, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelinePanelProps {
    duration?: number; // in seconds
    currentTime?: number;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onSeek: (time: number) => void;
}

export function TimelinePanel({
    duration = 36.6,
    currentTime = 0,
    isPlaying,
    onTogglePlay,
    onSeek
}: TimelinePanelProps) {
    const ticks = Array.from({ length: 25 }, (_, i) => i);

    return (
        <div className="flex flex-col h-full bg-[#0d0d12] overflow-hidden font-sans select-none">
            {/* Timeline Ruler Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Track Headers (Left sidebar of timeline) */}
                <div className="w-[64px] border-r border-white/5 bg-[#0a0a0a] flex flex-col pt-8">
                    <div className="h-10 border-b border-white/5 flex items-center justify-center font-bold text-gray-500 text-sm">2</div>
                    <div className="h-10 border-b border-white/5 flex items-center justify-center font-bold text-gray-500 text-sm opacity-20">3</div>
                    <div className="h-10 border-b border-white/5 flex items-center justify-center font-bold text-gray-500 text-sm opacity-20">4</div>
                </div>

                {/* Tracks Area */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#0d0d12] relative">
                    <div className="min-w-[3000px] h-full flex flex-col relative">
                        {/* Ruler */}
                        <div className="h-8 flex items-end px-2 border-b border-white/5 relative">
                            {ticks.map(tick => (
                                <div key={tick} className="absolute flex flex-col items-center gap-1" style={{ left: `${tick * 120}px` }}>
                                    <span className="text-[10px] font-extrabold text-gray-600 tabular-nums">{tick}s</span>
                                    <div className="h-1.5 w-[1px] bg-white/10" />
                                </div>
                            ))}
                        </div>

                        {/* Tracks Content */}
                        <div className="flex-1 pt-0 relative z-0">
                            {/* Track 2: Video */}
                            <div className="h-10 flex items-center relative border-b border-white/5 bg-white/[0.02]">
                                <div
                                    className="absolute left-[120px] h-7 w-[480px] bg-[#cc4a3b] rounded-md border border-white/10 flex items-center px-2 mr-[1px] shadow-lg shadow-black/20"
                                    style={{ left: '0px', width: '240px' }} // Adjusted for 0-2s
                                >
                                    <span className="text-[10px] font-black text-white/80 uppercase truncate">Intro</span>
                                </div>
                                <div
                                    className="absolute h-7 w-[840px] bg-[#cc4a3b]/60 rounded-md border border-white/10 flex items-center px-2 shadow-lg shadow-black/20"
                                    style={{ left: '240px', width: '500px' }} // 2-6s approx
                                >
                                    <span className="text-[10px] font-black text-white/80 uppercase truncate">Video</span>
                                </div>
                            </div>

                            {/* Track 3: Image / Zoom */}
                            <div className="h-10 flex items-center relative border-b border-white/5">
                                <div
                                    className="absolute h-7 w-64 bg-[#cc4a3b]/40 rounded-md border border-white/10 flex items-center px-2 gap-2"
                                    style={{ left: '10px' }}
                                >
                                    <Search className="w-3 h-3 text-white/50" />
                                    <span className="text-[9px] font-black text-white/50 uppercase">Image</span>
                                </div>

                                <div
                                    className="absolute h-7 w-64 bg-[#3b82f6]/30 rounded-md border border-white/10 flex items-center px-2 gap-2"
                                    style={{ left: '300px' }}
                                >
                                    <ZoomIn className="w-3 h-3 text-white/60" />
                                    <span className="text-[9px] font-black text-white/60 uppercase">Zoom</span>
                                    <div className="ml-auto w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                                        <div className="w-1 h-1 bg-white/50 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Track 4: More Video Segments */}
                            <div className="h-10 flex items-center relative border-b border-white/5">
                                <div
                                    className="absolute h-7 w-[200px] bg-[#cc4a3b]/20 rounded-md border border-white/5 flex items-center px-2 mr-[1px]"
                                    style={{ left: '0px' }}
                                >
                                    <span className="text-[9px] font-black text-white/30 truncate uppercase">Intro</span>
                                </div>
                                <div
                                    className="absolute h-7 w-[400px] bg-[#cc4a3b]/10 rounded-md border border-white/5 flex items-center px-2"
                                    style={{ left: '202px' }}
                                >
                                    <span className="text-[9px] font-black text-white/30 truncate uppercase">Video</span>
                                </div>
                            </div>
                        </div>

                        {/* Playhead Indicator */}
                        <div
                            className="absolute top-0 bottom-0 w-[1.5px] bg-pink-500 z-50 pointer-events-none transition-all duration-75"
                            style={{ left: `${currentTime * 120 + 2}px` }}
                        >
                            <div className="absolute top-0 -left-[5px] w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)] flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
