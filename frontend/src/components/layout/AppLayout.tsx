"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, useAuth } from "@clerk/nextjs";

/**
 * AppLayout Component
 * 
 * Provides a flexible layout system.
 * - Public Landing: Bypass the shell.
 * - Authenticated Workspace: Professional dashboard shell.
 * - Share Pages: Minimalist viewer shell.
 */
import { ProjectProvider } from "@/context/ProjectContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // 1. Share pages: Minimal shell
    if (pathname.startsWith("/share/")) {
        return <div className="min-h-screen bg-gray-950 font-sans">{children}</div>;
    }

    // 2. All other pages (Landing, Dashboard, Auth):
    // allow them to control their own layout completely.
    // This removes the old "Authenticated Workspace Shell" that was causing collisions.
    return (
        <ProjectProvider>
            <React.Fragment>{children}</React.Fragment>
        </ProjectProvider>
    );
}
