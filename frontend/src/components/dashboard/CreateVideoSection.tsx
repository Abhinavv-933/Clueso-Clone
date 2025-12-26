"use client";

import React from "react";
import { Monitor, Upload, FileText, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectType, useProjects } from "@/context/ProjectContext";


const ACTIONS: {
    title: string;
    description: string;
    icon: any;
    type: ProjectType;
    gradient: string;
    borderHover: string;
    iconColor: string;
}[] = [
        {
            title: "Record screen",
            description: "Turn a screen-recording into a studio-style video.",
            icon: Monitor,
            type: "record",
            gradient: "from-pink-500/20 to-purple-500/20",
            borderHover: "group-hover:border-pink-500/50",
            iconColor: "text-pink-400",
        },
        {
            title: "Upload a video",
            description: "Upload a screen recording. Get a studio-style video.",
            icon: Upload,
            type: "upload",
            gradient: "from-blue-500/20 to-cyan-500/20",
            borderHover: "group-hover:border-blue-500/50",
            iconColor: "text-blue-400",
        },
        {
            title: "Upload a slide deck",
            description: "Turn any PDF or PPT into a narrated video.",
            icon: FileText,
            type: "slides",
            gradient: "from-orange-500/20 to-red-500/20",
            borderHover: "group-hover:border-orange-500/50",
            iconColor: "text-orange-400",
        },
    ];

export function CreateVideoSection() {
    const { openUploadModal } = useProjects();

    const handleAction = (type: ProjectType) => {
        if (type === "upload") {
            openUploadModal();
            return;
        }

        // For other types, do nothing or show toast "Coming Soon"
        // We will disable them in UI for now
    };

    return (
        <section className="w-full space-y-4">
            <div className="flex items-center gap-2">
                {/* Optional section icon/header styling could go here */}
                <Video className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-white">Create a new video</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ACTIONS.map((action) => {
                    const isDisabled = action.type !== "upload";
                    return (
                        <button
                            key={action.title}
                            onClick={() => !isDisabled && handleAction(action.type)}
                            disabled={isDisabled}
                            className={cn(
                                "block group relative w-full text-left transition-all",
                                isDisabled ? "opacity-50 cursor-not-allowed" : ""
                            )}
                        >
                            <div
                                className={cn(
                                    "relative h-full overflow-hidden rounded-lg border border-white/5 bg-[#161622] p-4 transition-all duration-300",
                                    !isDisabled && "hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5",
                                    !isDisabled && action.borderHover
                                )}
                            >
                                {/* Card content */}
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className={cn(
                                        "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/5 transition-colors",
                                        !isDisabled && "group-hover:bg-white/10"
                                    )}>
                                        <action.icon className={cn("h-5 w-5", action.iconColor)} />
                                    </div>

                                    <h3 className={cn(
                                        "mb-1 text-sm font-bold text-white transition-colors",
                                        !isDisabled && "group-hover:text-white"
                                    )}>
                                        {action.title}
                                    </h3>

                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {action.description}
                                    </p>

                                    {isDisabled && (
                                        <span className="mt-2 inline-block text-[10px] font-medium text-white/40 bg-white/5 px-2 py-0.5 rounded">
                                            Coming soon
                                        </span>
                                    )}
                                </div>

                                {/* Background Gradient Effect - visible on hover mostly */}
                                {!isDisabled && (
                                    <div
                                        className={cn(
                                            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                                            action.gradient
                                        )}
                                    />
                                )}

                                {/* Subtle shine on hover */}
                                {!isDisabled && (
                                    <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                                )}

                            </div>
                        </button>
                    )
                })}
            </div>


        </section>
    );
}
