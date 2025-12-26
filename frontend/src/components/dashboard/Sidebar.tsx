
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useProjects } from "@/context/ProjectContext";
import {
    Home,
    FolderOpen,
    LayoutTemplate,
    Users,
    BarChart2,
    Settings,
    Trash2,
    Zap,
    ChevronDown,
    Search,
    LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Types
export interface User {
    name: string;
    email: string;
    avatar?: string;
    plan?: "trial" | "pro" | "enterprise";
    trialDaysLeft?: number;
}

interface SidebarProps {
    user?: User;
}

// Constants
const MOCK_USER: User = {
    name: "Guest User",
    email: "guest@example.com",
    plan: "trial",
    trialDaysLeft: 7,
};

const NAV_ITEMS = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "All Projects", icon: FolderOpen, href: "/dashboard/projects" },
    { label: "Video Templates", icon: LayoutTemplate, href: "/dashboard/templates" },
    { label: "Auto-update", icon: Zap, href: "/dashboard/auto-update" },
    { label: "Team", icon: Users, href: "/dashboard/team" },
    { label: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
];

const UTILITY_ITEMS = [
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
    { label: "Trash", icon: Trash2, href: "/dashboard/trash" },
];

export function Sidebar({ user: propUser }: SidebarProps) {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user: clerkUser, isLoaded } = useUser();
    const { signOut } = useClerk();
    const [isMounted, setIsMounted] = useState(false);
    const { openUploadModal } = useProjects();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleCreateNewVideo = () => {
        openUploadModal();
    };

    // effectiveUser logic:
    // 1. If not mounted yet (SSR/Hydration), use MOCK_USER or propUser to ensure stability.
    // 2. Once mounted and Clerk loaded, use clerkUser if available.
    // 3. Fallback to MOCK_USER if no user found.
    // This prevents Server (Guest) vs Client (Auth) mismatch on first render.
    const effectiveUser: User = (isMounted && isLoaded && clerkUser)
        ? {
            name: clerkUser.fullName || clerkUser.firstName || "User",
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            avatar: clerkUser.imageUrl,
            plan: "trial",
            trialDaysLeft: 7,
        }
        : propUser || MOCK_USER;

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Prevent rendering during SSR to avoid hydration mismatch
    // Browser extensions can add attributes (like fdprocessedid) that differ between server and client
    // Return a placeholder to maintain layout spacing
    if (!isMounted) {
        return <div className="w-64" aria-hidden="true" />;
    }

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/10 bg-[#0f0f16] p-4 text-white flex flex-col">
            {/* Header / Logo */}
            <div className="mb-6 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    {/* Logo Placeholder - simplified icon */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 font-bold text-white">
                        <LayoutTemplate className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Clueso</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-panel-left-close h-4 w-4"
                    >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 3v18" />
                        <path d="m16 15-3-3 3-3" />
                    </svg>
                </Button>
            </div>





            {/* Primary Action */}
            <div className="mb-6 px-2">
                <Button
                    onClick={handleCreateNewVideo}
                    className="w-full bg-gradient-to-r from-[#ed64a6] to-[#f43f5e] font-medium text-white shadow-lg shadow-pink-500/20 hover:opacity-90 transition-opacity"
                >
                    + New video
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6 px-2 relative">
                <Search className="absolute left-4 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search ..."
                    className="pl-9 bg-transparent border-border/20 focus:border-border/40 text-sm placeholder:text-muted-foreground/70"
                />
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-hidden space-y-1">
                <nav className="space-y-1 px-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 relative",
                                    isActive
                                        ? "bg-[#1c1c2a] text-[#818cf8]"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-[#818cf8]" : "")} />
                                {item.label}
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#818cf8] rounded-l-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer Section (Pinned to bottom) */}
            <div className="mt-auto px-2 space-y-4 pt-4">
                {/* Utility Items */}
                <div className="space-y-1 border-t border-white/5 pt-4">
                    {UTILITY_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Trial Banner - Conditionally Rendered */}
                {effectiveUser.plan === "trial" && (
                    <div className="rounded-xl bg-gradient-to-r from-[#6366f1] to-[#a855f7] p-3 shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-start gap-2 relative z-10">
                            <div className="mt-0.5 text-yellow-300">
                                <Zap className="h-4 w-4 fill-yellow-300" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-white">Your trial expires in {effectiveUser.trialDaysLeft ?? 0} days</p>
                                <button className="mt-1 text-xs text-white/90 underline decoration-white/50 underline-offset-2 hover:text-white">
                                    Upgrade your plan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Profile with Dropdown */}
                <div className="relative">
                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute bottom-full left-0 mb-2 w-full rounded-md border border-white/10 bg-[#15151e] p-1 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-white hover:bg-white/5 transition-colors text-left">
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                    Settings
                                </button>
                                <div className="my-1 h-px bg-white/5" />
                                <button
                                    onClick={() => signOut({ redirectUrl: '/' })}
                                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors text-left"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log out
                                </button>
                            </div>
                        </>
                    )}

                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={cn(
                            "flex w-full items-center justify-between rounded-lg bg-[#15151e] p-3 text-sm border border-white/5 transition-all duration-200 hover:border-white/10 hover:bg-[#1c1c2a]",
                            isDropdownOpen && "border-white/20 bg-[#1c1c2a]"
                        )}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            {effectiveUser.avatar ? (
                                <img src={effectiveUser.avatar} alt={effectiveUser.name} className="h-8 w-8 rounded-full bg-[#27272a] object-cover" />
                            ) : (
                                <div className="flex h-8 w-8 min-w-[2rem] items-center justify-center rounded-full bg-[#27272a] text-xs font-medium text-white ring-2 ring-white/5">
                                    {getInitials(effectiveUser.name)}
                                </div>
                            )}

                            <div className="flex flex-col items-start overflow-hidden text-left">
                                <span className="font-medium text-white truncate w-full text-xs sm:text-sm">{effectiveUser.name}</span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground truncate w-full max-w-[100px]">{effectiveUser.email}</span>
                            </div>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
