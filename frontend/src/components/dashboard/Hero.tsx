
"use client";

import React from "react";
import { motion } from "framer-motion";

export function Hero() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-full overflow-hidden rounded-xl bg-[#0f0f16] px-6 py-8 text-center shadow-2xl ring-1 ring-white/10 sm:py-10"
        >
            {/* Background Gradients/Decorations - Scaed down */}
            <div className="absolute left-0 top-0 h-full w-full overflow-hidden pointer-events-none">
                {/* Left decoration */}
                <div className="absolute -left-5 -top-5 h-32 w-32 rounded-full bg-purple-600/20 blur-[60px]" />
                <div className="absolute left-5 top-5 h-20 w-20 rounded-full bg-blue-600/10 blur-[30px]" />

                {/* Right decoration */}
                <div className="absolute -right-5 -bottom-5 h-32 w-32 rounded-full bg-pink-600/20 blur-[60px]" />
                <div className="absolute right-10 bottom-10 h-24 w-24 rounded-full bg-purple-500/10 blur-[40px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Make something awesome
                </h1>
                <p className="text-sm font-medium text-muted-foreground sm:text-base">
                    Create stunning product videos and docs
                </p>
            </div>

            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
    );
}
