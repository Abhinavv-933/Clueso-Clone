"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    ArrowLeft,
    Share2,
    Cloud,
    HelpCircle,
    ChevronDown,
    Wand2,
    Pencil,
    LayoutGrid,
    Music,
    Type,
    Box,
    Headphones,
    MessageSquare,
    HelpCircleIcon,
    Languages,
    MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { ScriptSidebar } from "@/components/editor/ScriptSidebar";
import { VideoCanvas } from "@/components/editor/VideoCanvas";
import { TimelinePanel } from "@/components/editor/TimelinePanel";

// Define locally for convenience
interface ProjectDetail {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    s3Key: string;
    fileUrl?: string; // Signed URL from backend
    uploadId?: string;
    jobId?: string;
    script?: string;
}

interface ScriptSegment {
    id: string;
    type: string;
    text: string;
    speaker?: string;
}

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [transcriptByProject, setTranscriptByProject] = useState<Record<string, ScriptSegment[]>>({});

    // Derived state for current project - Strictly follow precedence:
    // 1. Local state (transcriptByProject)
    // 2. Server state (project.script)
    // 3. Fallback to empty
    const resolvedTranscriptSegments = (project?.id && transcriptByProject[project.id]) ??
        (project?.script ? [{ id: 'server-script', type: 'Script', text: project.script }] : undefined) ??
        [];
    const segments: ScriptSegment[] = Array.isArray(resolvedTranscriptSegments) ? resolvedTranscriptSegments : [{ id: 'resolved', text: String(resolvedTranscriptSegments), type: 'Script' }];
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Editor-specific state
    const [isProcessing, setIsProcessing] = useState(false);
    type TranscriptionStatus = "idle" | "starting" | "processing" | "completed" | "failed";
    const [transcriptionStatus, setTranscriptionStatus] = useState<TranscriptionStatus>("idle");
    const [isGeneratingVoiceover, setIsGeneratingVoiceover] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0.5);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState("");
    const [isSavingName, setIsSavingName] = useState(false);
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewrittenScript, setRewrittenScript] = useState<string | null>(null);
    const [rewriteError, setRewriteError] = useState<string | null>(null);


    const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api";

    const fetchProjectData = useCallback(async () => {
        if (!isLoaded || !isSignedIn) return;

        try {
            const token = await getToken();

            const res = await fetch(`${API_URL}/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                if (res.status === 404) throw new Error("Project not found");
                throw new Error("Failed to load project");
            }

            const data = await res.json();
            const mappedProject: ProjectDetail = {
                id: data.id,
                name: data.title,
                status: data.status,
                createdAt: data.createdAt,
                s3Key: data.s3Key,
                fileUrl: data.fileUrl,
                uploadId: data.uploadId,
                jobId: data.jobId,
            };

            setProject(mappedProject);
            setNewName(mappedProject.name);

            // NO AUTOMATIC MOCKING on load - transcript state is handled by transcriptByProject
            // If we had persisted transcript data, we would load it into transcriptByProject here

        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }, [id, isLoaded, isSignedIn, getToken, API_URL]);

    useEffect(() => {
        if (id) fetchProjectData();
    }, [id, fetchProjectData]);

    const handleRename = async () => {
        if (!newName.trim() || !project || newName === project?.name) {
            console.log('[Rename] Skipping rename:', { newNameEmpty: !newName.trim(), noProject: !project, sameAsOld: newName === project?.name });
            setIsEditingName(false);
            return;
        }

        console.log('[Rename] Starting rename:', { projectId: project.id, oldName: project.name, newName });
        setIsSavingName(true);
        try {
            const token = await getToken();
            console.log('[Rename] Got auth token, sending PATCH request to:', `${API_URL}/projects/${project.id}`);

            const res = await fetch(`${API_URL}/projects/${project.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: newName }),
            });

            console.log('[Rename] Response status:', res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('[Rename] Failed to update name. Status:', res.status);
                console.error('[Rename] Error response:', errorText);
                throw new Error(`Failed to update name (Status: ${res.status})`);
            }

            const updatedProject = await res.json();
            console.log('[Rename] Successfully renamed project:', updatedProject);
            setProject(prev => prev ? { ...prev, name: newName } : null);
        } catch (err) {
            console.error("[Rename] Rename failed:", err);
            if (project) setNewName(project.name);
            alert(`Failed to rename: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsSavingName(false);
            setIsEditingName(false);
        }
    };

    const fetchTranscript = async (projectId: string) => {
        const MAX_RETRIES = 20;
        const RETRY_DELAY = 1500;
        let retryCount = 0;
        let success = false;

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        while (retryCount < MAX_RETRIES && !success) {
            try {
                console.log(`[Transcript] Fetching real transcript for project: ${projectId} (Attempt ${retryCount + 1})`);
                const token = await getToken();
                const res = await fetch(`${API_URL}/clueso/transcript/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status === 200) {
                    const data = await res.json();
                    if (data.transcript) {
                        console.log('[Transcript] Received transcript data');
                        const newSegments: ScriptSegment[] = [{
                            id: 'imported-1',
                            text: data.transcript,
                            type: 'Script',
                            speaker: 'Speaker'
                        }];

                        setTranscriptByProject(prev => ({
                            ...prev,
                            [projectId]: newSegments
                        }));
                        setTranscriptionError(null);
                        setTranscriptionStatus("completed");
                        success = true;
                        break;
                    }
                } else if (res.status === 202) {
                    console.log(`[Transcript] Still processing. Waiting ${RETRY_DELAY}ms (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
                    // Update status to processing on first 202 to show active polling
                    if (retryCount === 0) {
                        setTranscriptionStatus("processing");
                    }
                    retryCount++;
                    if (retryCount < MAX_RETRIES) {
                        await sleep(RETRY_DELAY);
                    } else {
                        console.error('[Transcript] Max retries reached while waiting for transcript');
                        setTranscriptionError("Transcript generation timed out. Please try again later.");
                        setTranscriptionStatus("failed");
                    }
                } else {
                    console.error(`[Transcript] Failed to fetch transcript with status: ${res.status}`);
                    setTranscriptionError(`Failed to fetch transcript (Status: ${res.status})`);
                    setTranscriptionStatus("failed");
                    break;
                }
            } catch (err) {
                console.error('[Transcript] Error during fetch attempts:', err);
                setTranscriptionError(err instanceof Error ? err.message : 'Unknown error fetching transcript');
                setTranscriptionStatus("failed");
                break;
            }
        }
    };



    // Recursive polling function
    const pollJobStatus = async (jobId: string) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/clueso/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                console.error(`[Polling] Failed to fetch job status: ${res.status}`);
                return; // Stop polling on error
            }

            const data = await res.json();
            const status = data.status;
            const jobData = data.job;

            console.log(`[Polling] Job ${jobId} status: ${status}`);

            if (status === 'COMPLETED' || status === 'TRANSCRIBED' || status === 'SCRIPT_IMPROVED' || status === 'VOICE_GENERATED' || status === 'VIDEO_MERGED') {
                // Status will be set to "completed" in fetchTranscript when transcript is received
                // Show success briefly, then auto-dismiss
                setTranscriptionStatus("completed");
                setTimeout(() => setTranscriptionStatus("idle"), 5000);

                // Fetch the real transcript now that it is ready
                if (project?.id) {
                    await fetchTranscript(project.id);
                }
            } else if (status === 'FAILED') {
                setTranscriptionStatus("failed");
                const errorMessage = jobData?.errorMessage || data.error || 'Unknown fatal error in pipeline';
                setTranscriptionError(errorMessage);
            } else {
                // Continue polling
                setTimeout(() => pollJobStatus(jobId), 3000);
            }


        } catch (err) {
            console.error("[Polling] Error:", err);
            setTranscriptionStatus("failed");
            setTranscriptionError(err instanceof Error ? err.message : 'Unknown error during polling');
        }
    };

    const handleGenerateTranscript = async () => {
        if (!project) return;
        setTranscriptionError(null);
        setTranscriptionStatus("starting");
        console.log('[Transcription] Starting workflow...');

        try {
            const token = await getToken();
            let currentJobId = project.jobId;

            // 1. If we don't have a job yet, create one
            if (!currentJobId) {
                if (!project.uploadId) {
                    throw new Error("Cannot start transcription: Upload ID not found for this project.");
                }

                console.log('[Transcription] No existing job found. Creating new job...', { uploadId: project.uploadId, projectId: project.id });

                const createRes = await fetch(`${API_URL}/clueso/jobs/create-job`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        uploadId: project.uploadId,
                        projectId: project.id
                    }),
                });

                if (!createRes.ok) {
                    const errorText = await createRes.text();
                    throw new Error(`Failed to create job (Status: ${createRes.status}): ${errorText}`);
                }

                const jobData = await createRes.json();
                currentJobId = jobData.jobId;
                console.log('[Transcription] Job created successfully:', currentJobId);

                // Update local project state with new jobId
                setProject(prev => prev ? { ...prev, jobId: currentJobId } : null);
            } else {
                console.log('[Transcription] Using existing job:', currentJobId);
            }

            // 2. Start polling for results
            if (currentJobId) {
                pollJobStatus(currentJobId);
            }

        } catch (err) {
            console.error("[Transcription] Workflow failed:", err);
            setTranscriptionError(err instanceof Error ? err.message : 'Unknown error starting transcription');
            setTranscriptionStatus("failed");
        }

    };

    const handleGenerateVoiceover = async () => {
        if (!project || segments.length === 0) return;
        setIsGeneratingVoiceover(true);
        try {
            const token = await getToken();
            await fetch(`${API_URL}/clueso/voiceover`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ projectId: project.id, script: segments.map(s => s.text).join(" ") }),
            });

            setTimeout(() => setIsGeneratingVoiceover(false), 3000);
        } catch (err) {
            console.error("Voiceover failed", err);
            setIsGeneratingVoiceover(false);
        }
    };

    const handleSmartRewrite = async () => {
        if (!project || segments.length === 0) return;

        const fullText = segments.map(s => s.text).join("\n");
        if (!fullText.trim()) return;

        setIsRewriting(true);
        setRewriteError(null);
        setRewrittenScript(null);

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/clueso/rewrite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: fullText }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to rewrite script");
            }

            const data = await res.json();
            setRewrittenScript(data.rewrittenText);
        } catch (err: any) {
            console.error("[Rewrite] Failed:", err);
            setRewriteError(err.message || "Unknown error during rewrite");
        } finally {
            setIsRewriting(false);
        }
    };

    if (!isLoaded || isLoading) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm font-medium">Loading project...</span>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-red-500">Error</h1>
                <p className="text-gray-400">{error || "Project not found"}</p>
                <button onClick={() => router.push("/home")} className="px-4 py-2 bg-white/10 rounded hover:bg-white/20 transition">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // ... (Rest of the imports and state above line 201 remain same)

    const nav = (
        <div className="flex flex-col items-center gap-6 py-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-lg shadow-pink-500/5 transition-all hover:bg-pink-500 hover:text-white cursor-pointer">
                <Type className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:text-white transition-all cursor-pointer group leading-none gap-1">
                <LayoutGrid className="w-5 h-5" />
                <span className="text-[8px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Elements</span>
            </div>
            <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:text-white transition-all cursor-pointer group leading-none gap-1">
                <Box className="w-5 h-5" />
                <span className="text-[8px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Templates</span>
            </div>
            <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:text-white transition-all cursor-pointer group leading-none gap-1">
                <Headphones className="w-5 h-5" />
                <span className="text-[8px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Music</span>
            </div>
            <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:text-white transition-all cursor-pointer group leading-none gap-1">
                <MessageSquare className="w-5 h-5" />
                <span className="text-[8px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Captions</span>
            </div>

            <div className="mt-auto flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-gray-600 hover:text-white transition-all cursor-pointer group leading-none gap-1">
                    <HelpCircleIcon className="w-5 h-5" />
                    <span className="text-[8px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Support</span>
                </div>
            </div>
        </div>
    );

    const topbar = (
        <div className="flex-1 flex items-center px-4 gap-6 h-full font-sans">
            <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#c026d3] flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                    <button className="text-[13px] font-bold text-gray-400 hover:text-white transition-colors">File</button>
                    <div className="h-4 w-[1px] bg-white/10 mx-1" />
                    <span className="text-[13px] font-black tracking-tight text-white/90">
                        {project.name}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex justify-center h-full">
                <div className="flex items-center gap-10">
                    <div className="h-full flex flex-col justify-center relative group cursor-pointer">
                        <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-white" />
                            <span className="text-[13px] font-black text-white px-2">Video</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
                    </div>
                    <div className="h-full flex flex-col justify-center relative group cursor-pointer">
                        <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Type className="w-4 h-4 text-white" />
                            <span className="text-[13px] font-black text-white px-2">Article</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 mr-4">
                    <button className="p-2 text-gray-500 hover:text-white transition-colors"><Cloud className="w-5 h-5" /></button>
                    <button className="p-2 text-gray-500 hover:text-white transition-colors"><HelpCircle className="w-5 h-5" /></button>
                </div>

                <button className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-[11px] font-black uppercase tracking-wider text-gray-300 transition-all">
                    <Languages className="w-3.5 h-3.5" />
                    Translate
                </button>

                <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#ed4ba9] to-[#c026d3] text-white text-[11px] font-black uppercase tracking-[0.1em] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-pink-500/20">
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                </button>
            </div>
        </div>
    );

    return (
        <EditorLayout
            topbar={topbar}
            nav={nav}
            sidebar={
                <ScriptSidebar
                    segments={segments}
                    onSegmentChange={(sid, text) => {
                        if (!project?.id) return;
                        setTranscriptByProject(prev => ({
                            ...prev,
                            [project.id]: (prev[project.id] || []).map(s => s.id === sid ? { ...s, text } : s)
                        }));
                    }}
                    onAiRewrite={handleSmartRewrite}
                    onGenerateVoiceover={handleGenerateVoiceover}
                    onGenerateTranscript={handleGenerateTranscript}
                    isProcessing={isProcessing}
                    transcriptionStatus={transcriptionStatus}
                    isGeneratingVoiceover={isGeneratingVoiceover}
                    isRewriting={isRewriting}
                    rewrittenScript={rewrittenScript}
                    rewriteError={rewriteError}
                    transcriptionError={transcriptionError}
                />

            }
            timeline={
                <TimelinePanel
                    isPlaying={isPlaying}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    onSeek={setCurrentTime}
                    currentTime={currentTime}
                />
            }
        >
            <VideoCanvas
                videoUrl={project.fileUrl}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
            />
        </EditorLayout>
    );
}
