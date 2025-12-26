
import React from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Monitor, Upload, FileText, Loader2, Play, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project, ProjectType, useProjects } from "@/context/ProjectContext";

const TYPE_ICONS: Record<ProjectType, any> = {
    record: Monitor,
    upload: Upload,
    slides: FileText,
};

const TYPE_COLORS: Record<ProjectType, string> = {
    record: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    upload: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    slides: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export function ProjectCard({ project }: { project: Project }) {
    const router = useRouter();
    const { deleteProject } = useProjects();
    const Icon = TYPE_ICONS[project.type] || Monitor;
    const typeColor = TYPE_COLORS[project.type] || TYPE_COLORS.record;

    const handleCardClick = () => {
        router.push(`/projects/${project.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteProject(project.id);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group block cursor-pointer relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick();
                }
            }}
        >
            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#161622] transition-all hover:border-white/10 hover:-translate-y-1 hover:shadow-xl">
                {/* Thumbnail Placeholder */}
                <div className="aspect-video w-full bg-gradient-to-br from-white/5 to-white/0 p-4 flex items-center justify-center relative group-hover:bg-white/5 transition-colors">
                    {project.status === "processing" ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Processing...</span>
                        </div>
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
                            <Play className="h-5 w-5 ml-1 fill-white" />
                        </div>
                    )}

                    {/* Type Badge */}
                    <div className={cn("absolute right-3 top-3 rounded-md px-2 py-1 text-[10px] font-medium border uppercase tracking-wider", typeColor)}>
                        {project.type}
                    </div>

                    {/* Delete Button - Top left or hidden until hover */}
                    {/* Delete Button - Top left, subtle visibility by default */}
                    <button
                        onClick={handleDelete}
                        className="absolute left-3 top-3 p-1.5 rounded-md text-white/40 hover:text-white hover:bg-red-500/80 transition-all duration-200 z-20"
                        title="Delete project"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-1">
                    <h3 className="font-semibold text-white truncate pr-2 group-hover:text-blue-400 transition-colors">
                        {project.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
                        <span>•</span>
                        <span className={cn(
                            "capitalize",
                            project.status === "ready" ? "text-green-400" : "text-yellow-400"
                        )}>
                            {project.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

