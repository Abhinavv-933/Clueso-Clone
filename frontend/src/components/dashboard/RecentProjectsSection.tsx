"use client";

import React, { useState, useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { useProjects } from "@/context/ProjectContext";
import { ProjectCard } from "@/components/dashboard/ProjectCard";

export function RecentProjectsSection() {
    const { projects, isLoading } = useProjects();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent hydration mismatch by rendering nothing or skeleton until mounted
    // OR we can render Empty State as default if we prefer, but might flash.
    // Given the requirement for "Server Component safe" initially, the empty state was static.
    // Now we are client.
    if (!isMounted) {
        return (
            <section className="w-full space-y-4">
                <h2 className="text-sm font-semibold text-white">Recent projects</h2>
                <div className="h-[366px] w-full rounded-xl border border-white/5 bg-[#161622]" />
            </section>
        )
    }

    const hasProjects = projects.length > 0;

    return (
        <section className="w-full space-y-4">
            {/* Header */}
            <h2 className="text-sm font-semibold text-white">Recent projects</h2>

            {hasProjects ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                /* Empty State Container - Fixed dimensions as requested (approx) */
                <div className="relative flex h-[366px] w-full flex-col items-center justify-center rounded-xl border border-white/5 bg-[#161622] p-8 text-center transition-all">

                    {/* Decorative Background Elements (Static SVGs / Orbits) */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Center Glow */}
                        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[80px]" />

                        {/* Orbit Rings (CSS Borders) */}
                        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 opacity-50" />
                        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 opacity-30" />
                        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 opacity-20" />

                        {/* Nodes / Dots */}
                        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 animate-[spin_10s_linear_infinite]">
                            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        </div>
                        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-[spin_15s_linear_infinite_reverse]">
                            <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center space-y-4 max-w-sm">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 shadow-inner ring-1 ring-white/10">
                            <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-white">No projects found</h3>
                            <p className="text-sm text-muted-foreground">
                                Choose an option above to create your first project
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
