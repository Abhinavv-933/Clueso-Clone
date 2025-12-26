
import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#0f0f16]">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
