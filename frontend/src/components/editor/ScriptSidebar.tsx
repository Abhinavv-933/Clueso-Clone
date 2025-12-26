import React, { useState } from 'react';
import { Wand2, Plus, MoreHorizontal, MessageSquare, Sparkles, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScriptSegment {
    id: string;
    type: string;
    text: string;
    speaker?: string;
}

interface ScriptSidebarProps {
    segments: ScriptSegment[];
    activeSegmentId?: string;
    onSegmentChange: (id: string, text: string) => void;
    onAiRewrite: () => void;
    onGenerateVoiceover: () => void;
    onGenerateTranscript: () => void;
    isProcessing?: boolean;
    transcriptionStatus?: "idle" | "starting" | "processing" | "completed" | "failed";
    isGeneratingVoiceover?: boolean;
    isRewriting?: boolean;
    rewrittenScript?: string | null;
    rewriteError?: string | null;
    transcriptionError?: string | null;
}

export function ScriptSidebar({
    segments,
    activeSegmentId,
    onSegmentChange,
    onAiRewrite,
    onGenerateVoiceover,
    onGenerateTranscript,
    isProcessing,
    transcriptionStatus = "idle",
    isGeneratingVoiceover,
    isRewriting,
    rewrittenScript,
    rewriteError,
    transcriptionError
}: ScriptSidebarProps) {

    const [activeTab, setActiveTab] = useState<string>("script");
    const hasTranscript = segments.length > 0;

    const SIDEBAR_SECTIONS = [
        { id: "script", label: "Transcript" },
        { id: "rewrite", label: "Rewrite" }
    ];

    return (
        <div id="script-sidebar-container" className="flex flex-col h-full overflow-hidden bg-[#0d0d12]">
            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 pt-4 pb-2 border-b border-white/5">
                {SIDEBAR_SECTIONS.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveTab(section.id)}
                        className={cn(
                            "text-sm font-bold relative py-2 transition-colors",
                            activeTab === section.id ? "text-white" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        {section.label}
                        {activeTab === section.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Actions Bar */}
            <div className="p-4 flex items-center gap-2">
                <button
                    onClick={onGenerateVoiceover}
                    disabled={!hasTranscript || isGeneratingVoiceover}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#1a1a1a] border border-white/5 text-xs font-bold text-white hover:bg-[#252525] transition-all disabled:opacity-50 group"
                >
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                    {isGeneratingVoiceover ? "Generating..." : "Generate Speech"}
                </button>

                <div className="flex items-center bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden group">
                    <button
                        onClick={onAiRewrite}
                        disabled={!hasTranscript || isProcessing || isRewriting}
                        className="flex items-center gap-2 py-2 px-3 text-xs font-bold text-white hover:bg-[#252525] border-r border-white/5 disabled:opacity-50"
                    >
                        {isRewriting ? (
                            <div className="w-3.5 h-3.5 border border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Wand2 className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        {isRewriting ? "Rewriting..." : "Smart Rewrite"}
                    </button>
                    <button className="p-2 hover:bg-[#252525] text-gray-400 hover:text-white transition-colors">
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                </div>

                <button className="p-2.5 rounded-xl bg-[#1a1a1a] border border-white/5 text-gray-400 hover:text-white hover:bg-[#252525] transition-all">
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'script' ? (
                    <div className="p-2 space-y-2">
                        {!hasTranscript && transcriptionStatus === "idle" ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6 mt-10">
                                <div className="w-16 h-16 rounded-3xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.1)]">
                                    <Sparkles className="w-8 h-8 text-pink-500" />
                                </div>
                                <div className="space-y-2">
                                    <button
                                        onClick={onGenerateTranscript}
                                        className="px-6 py-2.5 bg-pink-500 rounded-xl text-white font-bold text-sm shadow-xl shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Generate Transcript
                                    </button>
                                    <p className="text-[11px] text-gray-500 font-medium">Create a script from your video instantly.</p>
                                </div>
                            </div>
                        ) : transcriptionStatus === "starting" || transcriptionStatus === "processing" ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 mt-20">
                                <div className="w-10 h-10 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                                <div className="text-center space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                                        {transcriptionStatus === "starting" ? "Starting transcription..." : "Transcription in progress"}
                                    </span>
                                    {transcriptionStatus === "processing" && (
                                        <p className="text-[10px] text-gray-600 font-medium">This may take a minute for longer videos</p>
                                    )}
                                </div>
                            </div>
                        ) : transcriptionError ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 mt-10">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
                                    <Plus className="w-6 h-6 text-red-500 rotate-45" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-tight">Transcription Failed</h3>
                                    <p className="text-[11px] text-gray-400 font-medium px-4">{transcriptionError}</p>
                                    <button
                                        onClick={onGenerateTranscript}
                                        className="mt-2 text-[11px] font-black text-white hover:text-pink-500 transition-colors uppercase tracking-widest"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : hasTranscript ? (
                            // Render transcript segments if they exist, regardless of status
                            segments.map((segment, index) => (
                                <div
                                    key={segment.id || index}
                                    className={cn(
                                        "p-4 rounded-2xl transition-all border border-transparent space-y-3 group",
                                        segment.id === activeSegmentId ? "bg-white/5 border-white/10" : "hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-bold text-gray-600 w-3">{index + 1}</span>
                                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                                                <span className="text-[10px] font-black text-white/50">{segment.type || "Video"}</span>
                                                <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-pink-500/20">
                                                    {segment.speaker ? segment.speaker[0] : 'S'}
                                                </div>
                                                <span className="text-[11px] font-extrabold text-[#ff4da6]">{segment.speaker || "Speaker"}</span>
                                            </div>
                                        </div>
                                        <button className="text-gray-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <div
                                            contentEditable
                                            suppressContentEditableWarning
                                            className="w-full bg-transparent text-[13px] font-medium text-gray-300 leading-relaxed outline-none focus:text-white transition-colors border-none p-0 whitespace-pre-wrap overflow-y-auto min-h-[3em]"
                                            onBlur={(e) => onSegmentChange(segment.id, e.currentTarget.textContent || "")}
                                        >
                                            {segment.text}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : null}
                    </div>
                ) : (
                    <div className="p-6 h-full">
                        {isRewriting ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-center mt-20">
                                <div className="w-10 h-10 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">AI is Rewriting</span>
                                    <p className="text-[10px] text-gray-600 font-medium">Professional polished script coming right up...</p>
                                </div>
                            </div>
                        ) : rewriteError ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 mt-10">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
                                    <Plus className="w-6 h-6 text-red-500 rotate-45" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-tight">Rewrite Failed</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">{rewriteError}</p>
                                    <button
                                        onClick={onAiRewrite}
                                        className="mt-2 text-[11px] font-black text-white hover:text-pink-500 transition-colors uppercase tracking-widest"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        ) : rewrittenScript ? (
                            <div className="space-y-4 animate-in fade-in duration-500 h-full">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-pink-500" />
                                        <span className="text-[11px] font-black text-white uppercase tracking-wider">Polished Script</span>
                                    </div>
                                    <button className="text-[10px] font-bold text-pink-500 hover:text-pink-400 transition-colors uppercase tracking-widest">
                                        Apply All
                                    </button>
                                </div>
                                <div
                                    contentEditable
                                    suppressContentEditableWarning
                                    className="w-full bg-transparent text-[13px] font-medium text-gray-300 leading-relaxed outline-none focus:text-white transition-colors border-none p-0 whitespace-pre-wrap selection:bg-pink-500/30 overflow-y-auto"
                                >
                                    {rewrittenScript}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 mt-10">
                                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                                    <Wand2 className="w-8 h-8 text-indigo-500" />
                                </div>
                                <div className="space-y-2">
                                    <button
                                        onClick={onAiRewrite}
                                        disabled={!hasTranscript}
                                        className="px-6 py-2.5 bg-indigo-500 rounded-xl text-white font-bold text-sm shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        Polish with AI
                                    </button>
                                    <p className="text-[11px] text-gray-500 font-medium px-8">Remove filler words, fix grammar, and improve the professional flow of your script.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
