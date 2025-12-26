
import React from "react";
import Link from "next/link";
import { Users, HelpCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GettingStartedSection() {
    return (
        <section className="w-full space-y-4">
            <h2 className="text-sm font-semibold text-white">Getting started</h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column: Video Cards (Takes up 2 cols on large screens) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">

                    {/* Video Card 1 */}
                    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#161622] transition-all hover:border-white/10">
                        {/* Thumbnail Area */}
                        <div className="relative aspect-video w-full bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-110">
                                    <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                                </div>
                            </div>
                            {/* Overlay Text/Logo Mockup */}
                            <div className="absolute left-4 top-4 opacity-50">
                                <span className="font-bold text-white text-xs tracking-wider">clueso</span>
                            </div>
                            <div className="absolute left-4 bottom-4 pr-12">
                                <h3 className="text-lg font-bold text-white leading-tight mb-1">Introduction to Clueso</h3>
                            </div>
                        </div>
                        {/* Footer Area */}
                        <div className="p-3">
                            <h3 className="text-sm font-semibold text-white">What is Clueso?</h3>
                            <p className="text-xs text-muted-foreground">An Introduction to Clueso</p>
                        </div>
                    </div>

                    {/* Video Card 2 */}
                    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#161622] transition-all hover:border-white/10">
                        {/* Thumbnail Area */}
                        <div className="relative aspect-video w-full bg-gradient-to-br from-pink-900/20 to-orange-900/20">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-110">
                                    <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                                </div>
                            </div>
                            <div className="absolute left-4 top-4 opacity-50">
                                <span className="font-bold text-white text-xs tracking-wider">clueso</span>
                            </div>
                            <div className="absolute left-4 bottom-4 pr-12">
                                <h3 className="text-lg font-bold text-white leading-tight mb-1">Create your first video</h3>
                            </div>
                        </div>
                        {/* Footer Area */}
                        <div className="p-3">
                            <h3 className="text-sm font-semibold text-white">How to create a video</h3>
                            <p className="text-xs text-muted-foreground">Make your first AI video</p>
                        </div>
                    </div>

                </div>

                {/* Right Column: Utility Cards */}
                <div className="flex flex-col gap-4">

                    {/* Invite Card */}
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#161622] p-4 transition-all hover:border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-muted-foreground">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Invite team members</h3>
                                <p className="text-xs text-muted-foreground">Create great content with your team</p>
                            </div>
                        </div>
                        <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white font-medium h-8 px-3 text-xs">
                            Add users
                        </Button>
                    </div>

                    {/* Help Center Card */}
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#161622] p-4 transition-all hover:border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-muted-foreground">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Visit our help center</h3>
                                <p className="text-xs text-muted-foreground">Learn how to use Clueso</p>
                            </div>
                        </div>
                        <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white font-medium h-8 px-3 text-xs">
                            Learn more
                        </Button>
                    </div>

                </div>
            </div>
        </section>
    );
}
