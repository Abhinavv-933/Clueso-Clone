
import React from "react";
import Link from "next/link";
import { Scissors, Zap, Languages, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
    {
        title: "Cuts",
        description: "Break down a long video into bite-sized clips and docs",
        icon: Scissors,
        href: "/tools/cuts",
        iconColor: "text-purple-400",
        bgHover: "hover:bg-purple-500/10",
        borderHover: "hover:border-purple-500/20",
    },
    {
        title: "Auto-update",
        description: "Update content when your product changes",
        icon: Zap,
        href: "/tools/auto-update",
        iconColor: "text-blue-400",
        bgHover: "hover:bg-blue-500/10",
        borderHover: "hover:border-blue-500/20",
    },
    {
        title: "Translator",
        description: "Dub a video into 37+ languages",
        icon: Languages,
        href: "/tools/translator",
        iconColor: "text-indigo-400",
        bgHover: "hover:bg-indigo-500/10",
        borderHover: "hover:border-indigo-500/20",
    },
];

export function AiToolsSection() {
    return (
        <section className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <h2 className="text-sm font-semibold text-white">AI tools</h2>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-purple-300 ring-1 ring-inset ring-purple-400/20">
                    NEW
                </span>
            </div>

            {/* Grid - switched to flex to support specific width */}
            <div className="flex flex-wrap gap-3">
                {TOOLS.map((tool) => (
                    <Link
                        key={tool.title}
                        href={tool.href}
                        className={cn(
                            "group relative flex h-[63px] w-[210px] items-center gap-3 rounded-lg border border-white/5 bg-[#161622] px-3 py-2 transition-all duration-300",
                            "hover:shadow-lg hover:-translate-y-0.5",
                            tool.bgHover,
                            tool.borderHover
                        )}
                    >
                        {/* Icon Box */}
                        <div className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/5 transition-colors group-hover:bg-white/10",
                            tool.iconColor
                        )}>
                            <tool.icon className="h-4 w-4" />
                        </div>

                        {/* Text Content */}
                        <div className="flex flex-col justify-center overflow-hidden">
                            <h3 className="text-xs font-bold text-white group-hover:text-white transition-colors truncate">
                                {tool.title}
                            </h3>
                            <p className="text-[10px] text-muted-foreground leading-tight truncate">
                                {tool.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
