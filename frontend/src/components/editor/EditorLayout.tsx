import React from 'react';

interface EditorLayoutProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    timeline: React.ReactNode;
    topbar: React.ReactNode;
    nav: React.ReactNode;
}

export function EditorLayout({ children, sidebar, timeline, topbar, nav }: EditorLayoutProps) {
    return (
        <div className="h-screen max-h-screen w-full bg-[#0a0a0a] text-white flex flex-col overflow-hidden font-sans select-none">
            {/* Top Bar */}
            <header className="h-14 border-b border-white/10 flex items-center shrink-0 bg-[#0a0a0a] z-50">
                {topbar}
            </header>

            {/* Main Area */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Leftmost Narrow Navigation (Icons) */}
                <aside className="w-[64px] border-r border-white/10 flex flex-col items-center py-4 bg-[#0a0a0a] z-40 shrink-0">
                    {nav}
                </aside>

                {/* Left Functional Sidebar (e.g. Script) */}
                <aside className="w-[320px] border-r border-white/10 flex flex-col shrink-0 bg-[#0f0f0f] z-30 transition-all overflow-y-auto">
                    {sidebar}
                </aside>

                {/* Center Canvas & Timeline Area */}
                <main className="flex-1 flex flex-col relative overflow-hidden bg-[#050505] z-10 font-sans min-w-0">
                    {/* Video Canvas Container */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 relative z-0 overflow-auto">
                        {children}
                    </div>

                    {/* Bottom Timeline */}
                    <footer className="h-36 border-t border-white/10 bg-[#0a0a0a] shrink-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                        {timeline}
                    </footer>
                </main>
            </div>
        </div>
    );
}
