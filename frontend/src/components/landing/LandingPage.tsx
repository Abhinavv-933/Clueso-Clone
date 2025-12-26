"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Testimonial Reveal Component with Scroll-Based Effect
function TestimonialReveal() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 0.9", "start 0.25"]
    });

    const testimonialText = "Clueso has empowered our Product team to produce high-quality videos & training content 20x faster";
    const words = testimonialText.split(" ");

    return (
        <section ref={containerRef} className="w-full bg-white py-32">
            <div className="mx-auto max-w-6xl px-6 text-center">
                {/* Headline with Scroll-Based Reveal */}
                <h2 className="text-[56px] leading-[1.1] mb-16">
                    {words.map((word, index) => {
                        // More gradual reveal - each word gets a small slice of the scroll progress
                        const totalWords = words.length;
                        const start = (index / totalWords) * 0.7; // Spread across 70% of scroll
                        const end = Math.min(start + 0.2, 0.85); // Each word reveals over 20% progress

                        return (
                            <Word
                                key={index}
                                word={word}
                                progress={scrollYProgress}
                                range={[start, end]}
                            />
                        );
                    })}
                </h2>

                {/* Testimonial Card */}
                <div className="max-w-md mx-auto mt-12 p-6 rounded-2xl border border-gray-200 bg-white">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-clueso-pink to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                            SO
                        </div>
                        {/* Name and Role */}
                        <div className="text-left">
                            <div className="font-bold text-gray-900 text-base">Sean O'Donnell</div>
                            <div className="text-sm text-gray-600">Director of Product Management, Phenom</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Individual Word Component with Scroll-Based Reveal
function Word({ word, progress, range }: { word: string; progress: any; range: [number, number] }) {
    const color = useTransform(
        progress,
        range,
        ["#E5E7EB", "#111827"]
    );
    const fontWeight = useTransform(
        progress,
        range,
        [400, 700]
    );

    return (
        <motion.span
            style={{
                color,
                fontWeight
            }}
            className="inline-block mr-[0.3em]"
        >
            {word}
        </motion.span>
    );
}

// Use Cases Section Component with Interactive Categories
function UseCasesSection() {
    const [selectedCategory, setSelectedCategory] = useState(0);

    const categories = [
        {
            icon: '📄',
            label: 'Customer Education',
            videoTitle: 'Getting Started with',
            videoSubtitle: 'Product Basics',
            subtitle: 'Customer Onboarding 101'
        },
        {
            icon: '📢',
            label: 'Product Marketing',
            videoTitle: 'New Feature',
            videoSubtitle: 'Announcement',
            subtitle: 'Product Launch Series'
        },
        {
            icon: '🎓',
            label: 'Learning & Development',
            videoTitle: 'Advanced Training',
            videoSubtitle: 'Workshop',
            subtitle: 'Employee Development'
        },
        {
            icon: '💰',
            label: 'Sales Enablement',
            videoTitle: 'Product Demo',
            videoSubtitle: 'Walkthrough',
            subtitle: 'Sales Training'
        },
        {
            icon: '📦',
            label: 'Product Management',
            videoTitle: 'Roadmap Planning',
            videoSubtitle: 'Session',
            subtitle: 'Product Strategy'
        },
        {
            icon: '🔄',
            label: 'IT Change Management',
            videoTitle: 'System Migration',
            videoSubtitle: 'Guide',
            subtitle: 'IT Operations'
        },
        {
            icon: '🎧',
            label: 'Customer Success/Support',
            videoTitle: 'Troubleshooting',
            videoSubtitle: 'Common Issues',
            subtitle: 'Support Documentation'
        },
        {
            icon: '⚙️',
            label: 'Engineering',
            videoTitle: 'Running Jupyter',
            videoSubtitle: 'Notebooks via Docker',
            subtitle: 'Technical Onboarding 101'
        }
    ];

    const currentVideo = categories[selectedCategory];

    return (
        <section className="w-full bg-white py-32">
            <div className="mx-auto max-w-7xl px-6">
                {/* Section Header */}
                <div className="mb-16">
                    <h2 className="text-[56px] font-bold text-gray-900 leading-tight mb-4">Clueso is built for you</h2>
                    <p className="text-lg text-gray-600">
                        Explaining software is hard. Clueso makes it easy.
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-12 gap-12">
                    {/* Left Sidebar - Use Case Categories */}
                    <div className="col-span-3 space-y-2">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedCategory(index)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${selectedCategory === index
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-lg">{category.icon}</span>
                                <span className="text-sm font-medium">{category.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Right Side - Video Preview Card */}
                    <div className="col-span-9">
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 h-[500px] flex flex-col justify-between p-12">
                            {/* Acme Logo */}
                            <div className="flex items-center gap-3 text-white">
                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-8 border-2 border-white rounded-full"></div>
                                    <div className="w-8 h-8 border-2 border-white rounded-full -ml-4"></div>
                                </div>
                                <span className="text-2xl font-bold">Acme</span>
                            </div>

                            {/* Video Title */}
                            <div className="text-white">
                                <h3 className="text-5xl font-bold mb-4 leading-tight">
                                    {currentVideo.videoTitle}<br />{currentVideo.videoSubtitle}
                                </h3>
                                <p className="text-xl text-blue-100">{currentVideo.subtitle}</p>
                            </div>

                            {/* Play Button */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <motion.div
                                    className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center cursor-pointer shadow-2xl"
                                    whileHover={{ scale: 1.1 }}
                                    animate={{
                                        boxShadow: [
                                            "0 0 0 0 rgba(220, 38, 38, 0.4)",
                                            "0 0 0 20px rgba(220, 38, 38, 0)",
                                            "0 0 0 0 rgba(220, 38, 38, 0)"
                                        ]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeOut"
                                    }}
                                >
                                    <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Features Section Component
function FeaturesSection() {
    const [cursorVisible, setCursorVisible] = useState(true);

    // Blinking cursor animation
    useEffect(() => {
        const interval = setInterval(() => {
            setCursorVisible((prev) => !prev);
        }, 530);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="w-full bg-white pt-32 pb-12">
            <div className="mx-auto max-w-7xl px-6">
                {/* Top Section */}
                <div className="mb-16">
                    {/* Features Label */}
                    <div className="flex items-center gap-2 mb-6">
                        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        <span className="text-sm font-bold tracking-widest text-purple-400 uppercase">Features</span>
                    </div>

                    {/* Main Heading */}
                    <h2 className="text-[56px] font-bold text-gray-900 leading-tight">
                        <span className="block">Still not convinced?</span>
                        <span className="block">Here's more you can do.</span>
                    </h2>
                </div>

                {/* Shape the Story Section */}
                <div className="relative rounded-2xl border-2 border-purple-300 p-8 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden">
                    {/* Diagonal Pattern Background */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 8px,
                                rgba(192, 132, 252, 0.15) 8px,
                                rgba(192, 132, 252, 0.15) 16px
                            )`
                        }}
                    />

                    {/* Section Heading */}
                    <div className="relative z-10 mb-8">
                        <h3 className="text-2xl font-bold text-purple-600">Shape the Story</h3>
                    </div>

                    {/* Feature Cards */}
                    <div className="relative z-10 grid grid-cols-2 gap-6">
                        {/* Left Card - Fine-Tune Your Video Script */}
                        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                            {/* Text Editor Mockup */}
                            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 min-h-[200px]">
                                <div
                                    className="relative h-full"
                                    style={{
                                        backgroundImage: `repeating-linear-gradient(
                                            0deg,
                                            transparent,
                                            transparent 24px,
                                            rgba(0, 0, 0, 0.03) 24px,
                                            rgba(0, 0, 0, 0.03) 25px
                                        )`
                                    }}
                                >
                                    <div className="text-gray-900 text-base leading-7 font-sans">
                                        You can edit the video script like thi
                                        <span
                                            className={`inline-block w-0.5 h-5 bg-pink-500 ml-1 align-middle transition-opacity duration-300 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}
                                        ></span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                    Fine-Tune Your Video Script
                                </h4>
                                <p className="text-gray-600 leading-relaxed">
                                    Effortlessly add, remove, or tweak sentences and pronunciations to craft your ideal script.
                                </p>
                            </div>
                        </div>

                        {/* Right Card - Customize Your Video Flow */}
                        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                            {/* Timeline Mockup */}
                            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 min-h-[200px] flex items-center justify-center relative">
                                <div
                                    className="absolute inset-0 opacity-10"
                                    style={{
                                        backgroundImage: `repeating-linear-gradient(
                                            45deg,
                                            transparent,
                                            transparent 10px,
                                            rgba(0, 0, 0, 0.05) 10px,
                                            rgba(0, 0, 0, 0.05) 20px
                                        )`
                                    }}
                                />

                                {/* Timeline Bar */}
                                <div className="relative z-10 w-full flex items-center justify-center">
                                    <div className="h-3 bg-gray-300 rounded-full w-full max-w-md relative">
                                        {/* Center Vertical Line */}
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-12 bg-gray-400"></div>

                                        {/* Add Button */}
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                            <div className="relative">
                                                {/* Purple Glow Rings - Outer */}
                                                <div className="absolute inset-0 w-20 h-20 rounded-full bg-purple-300 opacity-20 blur-2xl -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
                                                {/* Purple Glow Rings - Inner */}
                                                <div className="absolute inset-0 w-14 h-14 rounded-full bg-purple-200 opacity-30 blur-lg -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>

                                                {/* Black Button */}
                                                <button className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-10">
                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                    Customize Your Video Flow
                                </h4>
                                <p className="text-gray-600 leading-relaxed">
                                    Quickly insert or delete video clips, images, or text slides for complete creative control.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhance the Audio Section */}
                <div className="relative rounded-2xl border-2 border-blue-300 p-8 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden mt-12">
                    {/* Diagonal Pattern Background */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 8px,
                                rgba(59, 130, 246, 0.15) 8px,
                                rgba(59, 130, 246, 0.15) 16px
                            )`
                        }}
                    />

                    {/* Section Heading */}
                    <div className="relative z-10 mb-8">
                        <h3 className="text-2xl font-bold text-blue-600">Enhance the Audio</h3>
                    </div>

                    {/* Feature Cards */}
                    <div className="relative z-10 grid grid-cols-2 gap-6">
                        {/* Left Card - Give Your Video a Professional Voice */}
                        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                            {/* Voice Options */}
                            <div className="mb-8 space-y-3">
                                {/* Natasha */}
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">Natasha</span>
                                            <span className="text-xs">🇺🇸</span>
                                        </div>
                                        <p className="text-sm text-gray-600">Husky voice from North England.</p>
                                    </div>
                                </div>

                                {/* Arnold - Selected */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 transition-colors cursor-pointer">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">Arnold</span>
                                            <span className="text-xs">🇫🇷</span>
                                        </div>
                                        <p className="text-sm text-gray-600">Deep voice for news and information.</p>
                                    </div>
                                </div>

                                {/* Viraj */}
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">Viraj</span>
                                            <span className="text-xs">🇮🇳</span>
                                        </div>
                                        <p className="text-sm text-gray-600">Commanding yet soothing quality.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                    Give Your Video a Professional Voice
                                </h4>
                                <p className="text-gray-600 leading-relaxed">
                                    Select from dozens of natural-sounding AI voices with diverse accents, tones, and personalities.
                                </p>
                            </div>
                        </div>

                        {/* Right Card - Set the Perfect Mood with Music */}
                        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
                            {/* Music Mood Options */}
                            <div className="mb-8 space-y-2">
                                {/* Upbeat */}
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                    <span className="text-gray-400 font-medium">Upbeat</span>
                                </div>

                                {/* Inspiring */}
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                    <span className="text-gray-400 font-medium">Inspiring</span>
                                </div>

                                {/* Cinematic - Selected */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-600 transition-colors cursor-pointer">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                    <span className="text-white font-medium">Cinematic</span>
                                </div>

                                {/* Dramatic */}
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                    <span className="text-gray-400 font-medium">Dramatic</span>
                                </div>

                                {/* Mellow */}
                                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                    <span className="text-gray-400 font-medium">Mellow</span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                    Set the Perfect Mood with Music
                                </h4>
                                <p className="text-gray-600 leading-relaxed">
                                    Select a soundtrack from our extensive library, or upload your own music to match your unique style.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Customer Stories Section Component
function CustomerStoriesSection() {
    const g2Badges = [
        { label: "Best Usability", visible: true },
        { label: "Grid Leader", visible: true },
        { label: "High Performer", region: "ASIA", visible: true },
        { label: "Highest User Adoption", visible: true },
        { label: "Best Results", visible: true },
        { label: "Leader", visible: true },
        { label: "Most Implementable", visible: true },
        { label: "Users Most Likely To Recommend", visible: true },
        { label: "High Performer", region: "Asia WINTER 2025", large: true, visible: true },
        { label: "High Performer", visible: true },
    ];

    // Duplicate badges for seamless loop
    const topRowBadges = [...g2Badges.slice(0, 5), ...g2Badges.slice(0, 5)];
    const bottomRowBadges = [...g2Badges.slice(5, 10), ...g2Badges.slice(5, 10)];

    return (
        <section className="w-full bg-white py-32">
            <div className="mx-auto max-w-7xl px-6">
                {/* Heading with Button */}
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-[56px] font-bold text-gray-900 leading-tight">
                        Hear more from our customers
                    </h2>
                    <button className="px-6 py-3 border-2 border-pink-400 text-pink-500 rounded-lg font-semibold hover:bg-pink-50 transition-colors">
                        Read Customer Stories
                    </button>
                </div>

                {/* Main Content Box */}
                <div className="bg-gray-100 rounded-2xl p-12">
                    <div className="grid grid-cols-2 gap-12">
                        {/* Left Side - G2 Badges */}
                        <div className="overflow-hidden">
                            <div className="flex flex-col gap-4">
                                {/* Top Row - Moving Left to Right */}
                                <div className="relative overflow-hidden" style={{ height: '140px' }}>
                                    <motion.div
                                        className="flex gap-4"
                                        animate={{
                                            x: [0, -780] // Move left (negative x) - 5 badges * (140px + 16px gap)
                                        }}
                                        transition={{
                                            x: {
                                                repeat: Infinity,
                                                repeatType: "loop",
                                                duration: 30,
                                                ease: "linear"
                                            }
                                        }}
                                        style={{ width: 'max-content' }}
                                    >
                                        {topRowBadges.map((badge, index) => (
                                            <div
                                                key={index}
                                                className="bg-white rounded-t-lg rounded-b-xl p-4 shadow-md flex-shrink-0 border border-gray-200"
                                                style={{ minWidth: '140px', minHeight: '120px', clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)' }}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                                        SPRING 2025
                                                        {badge.region && ` ${badge.region}`}
                                                    </div>
                                                    <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-bold text-xs">G</span>
                                                    </div>
                                                </div>
                                                <div className="text-gray-900 font-bold text-xs mt-2 leading-tight">
                                                    {badge.label}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>

                                {/* Bottom Row - Moving Right to Left */}
                                <div className="relative overflow-hidden" style={{ height: '140px' }}>
                                    <motion.div
                                        className="flex gap-4"
                                        animate={{
                                            x: [-780, 0] // Move right (positive x) - 5 badges * (140px + 16px gap)
                                        }}
                                        transition={{
                                            x: {
                                                repeat: Infinity,
                                                repeatType: "loop",
                                                duration: 30,
                                                ease: "linear"
                                            }
                                        }}
                                        style={{ width: 'max-content' }}
                                    >
                                        {bottomRowBadges.map((badge, index) => (
                                            <div
                                                key={index}
                                                className={`bg-white rounded-t-lg rounded-b-xl p-4 shadow-md flex-shrink-0 border border-gray-200 ${badge.large ? 'min-w-[200px]' : ''}`}
                                                style={{ minWidth: '140px', minHeight: '120px', clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)' }}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                                        {badge.region ? badge.region.split(' ')[0] : 'SPRING 2025'}
                                                        {badge.region && ` ${badge.region.split(' ').slice(1).join(' ')}`}
                                                    </div>
                                                    <div className={`w-6 h-6 bg-red-600 rounded flex items-center justify-center flex-shrink-0 ${badge.large ? 'w-8 h-8' : ''}`}>
                                                        <span className={`text-white font-bold ${badge.large ? 'text-sm' : 'text-xs'}`}>G</span>
                                                    </div>
                                                </div>
                                                <div className="text-gray-900 font-bold text-xs mt-2 leading-tight">
                                                    {badge.label}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Statistics */}
                        <div className="flex flex-col justify-center space-y-16">
                            {/* Top Statistic - Rating */}
                            <div className="flex items-start gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-6xl font-bold text-gray-900">4.9</span>
                                        <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-gray-700 text-base">out of 5 stars on G2.com</p>
                                        <div className="text-gray-400 font-bold text-xl">
                                            G<sup>2</sup>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Statistic - Videos */}
                            <div className="flex items-start gap-6">
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className="text-6xl font-bold text-gray-900">100,000+</span>
                                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-700 text-base">
                                        videos created on Clueso in the past 6 months
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Testimonials Carousel Section Component
function TestimonialsCarouselSection() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials = [
        {
            name: "John Smith",
            role: "Director of Operations",
            company: "Global Partners",
            companyLogo: (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
                    <span className="text-blue-600 font-bold text-lg">GLOBAL PARTNERS</span>
                </div>
            ),
            testimonial: "Clueso has been a game-changer for supporting our front-line and office workers. Its intuitive interface and powerful AI let us quickly deliver clear, targeted content, dramatically boosting our productivity. Plus, Clueso's customer support is among the best of any vendor we use. A truly fantastic partner!",
            headshot: "👨‍💼" // Placeholder - in real app, use actual image
        },
        {
            name: "Sarah Johnson",
            role: "VP of Product",
            company: "TechFlow",
            companyLogo: (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"></div>
                    <span className="text-purple-600 font-bold text-lg">TECHFLOW</span>
                </div>
            ),
            testimonial: "We've tried multiple video creation tools, but Clueso stands out with its AI capabilities. The automatic script improvements and voiceover generation save us hours every week. Our team can now focus on strategy instead of video editing.",
            headshot: "👩‍💼"
        },
        {
            name: "Michael Chen",
            role: "Head of Learning & Development",
            company: "Enterprise Solutions",
            companyLogo: (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500"></div>
                    <span className="text-orange-600 font-bold text-lg">ENTERPRISE SOLUTIONS</span>
                </div>
            ),
            testimonial: "Clueso transformed how we create training materials. What used to take days now takes hours. The translation feature is incredible - we can reach our global workforce in their native languages instantly.",
            headshot: "👨‍💻"
        },
        {
            name: "Emily Rodriguez",
            role: "Chief Marketing Officer",
            company: "InnovateNow",
            companyLogo: (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                    <span className="text-cyan-600 font-bold text-lg">INNOVATENOW</span>
                </div>
            ),
            testimonial: "The quality of videos Clueso produces is outstanding. Our product demos look professional, and the customization options let us maintain our brand identity perfectly. It's become an essential tool for our marketing team.",
            headshot: "👩‍🎨"
        }
    ];

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const currentTestimonial = testimonials[currentIndex];
    const nextTestimonialData = testimonials[(currentIndex + 1) % testimonials.length];

    return (
        <section className="w-full bg-white py-32">
            <div className="mx-auto max-w-7xl px-6">
                {/* Heading */}
                <div className="mb-12">
                    <h2 className="text-[56px] font-bold text-gray-900 leading-tight mb-4">
                        You're in good company
                    </h2>
                    <p className="text-lg text-gray-600">
                        From start-ups to enterprises, teams of all sizes trust Clueso.
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative flex justify-center">
                    {/* Main Testimonial Card */}
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg" style={{ width: '1040px', height: '580px' }}>
                            <div className="flex h-full">
                                {/* Left Side - Headshot */}
                                <div className="relative overflow-hidden flex-shrink-0 flex items-center" style={{ width: '280px', height: '580px' }}>
                                    <div className="relative" style={{ width: '280px', height: '420px' }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-purple-100"></div>
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <div className="w-full h-full bg-white flex items-center justify-center text-8xl">
                                                {currentTestimonial.headshot}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Content */}
                                <div className="flex-1 p-12 flex flex-col justify-between flex-shrink-0" style={{ width: '760px' }}>
                                    <div className="flex-1">
                                        {/* Company Logo */}
                                        <div className="mb-8">
                                            {currentTestimonial.companyLogo}
                                        </div>

                                        {/* Testimonial Text */}
                                        <p
                                            className="mb-8"
                                            style={{
                                                fontFamily: 'Geist, "Geist Placeholder", sans-serif',
                                                fontSize: '24px',
                                                lineHeight: '36.48px',
                                                fontWeight: 400,
                                                letterSpacing: '-0.24px',
                                                color: '#5C5C5C'
                                            }}
                                        >
                                            {currentTestimonial.testimonial}
                                        </p>
                                    </div>

                                    {/* Name at Bottom */}
                                    <div className="text-sm text-gray-600 mt-auto">
                                        <div className="font-semibold text-gray-900">{currentTestimonial.name}</div>
                                        <div>{currentTestimonial.role}, {currentTestimonial.company}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next Card Peek */}
                        <div className="absolute right-0 top-0 bottom-0 w-32 overflow-hidden pointer-events-none">
                            <div className="bg-gray-50 rounded-2xl shadow-lg h-full ml-4 flex">
                                <div className="w-1/3 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-green-100"></div>
                                    <div className="relative h-full flex items-center justify-center p-4">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-300 to-green-400 flex items-center justify-center text-3xl">
                                            {nextTestimonialData.headshot}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevTestimonial}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors z-20"
                        aria-label="Previous testimonial"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={nextTestimonial}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors z-20"
                        aria-label="Next testimonial"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Dots Indicator */}
                <div className="flex justify-center gap-2 mt-8">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-gray-900 w-8' : 'bg-gray-300'
                                }`}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Four Steps Section Component with Scroll-Based Card Stack Animation
function FourStepsSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const steps = [
        {
            number: "01",
            action: "Record or Upload",
            description: "Record a new video with Clueso or upload an existing screen recording or slide deck.",
            color: "red",
            colorClass: "bg-red-600",
            widget: {
                type: "record",
                text: "Start Recording",
                timer: "00:00"
            }
        },
        {
            number: "02",
            action: "Clueso does the magic",
            description: "Clueso's AI improves your script, adds a natural-sounding AI voiceover, and enhances visuals.",
            color: "magenta",
            colorClass: "bg-pink-600",
            widget: {
                type: "sparkle",
                icon: "sparkle"
            }
        },
        {
            number: "03",
            action: "Customize to Your Liking",
            description: "Every video made by Clueso AI is fully customizable. Edit the voice, flow, or visuals directly from the video editor.",
            color: "blue",
            colorClass: "bg-blue-600",
            widget: {
                type: "slider"
            }
        },
        {
            number: "04",
            action: "Export & Share",
            description: "Download, embed, or share your creation as a link instantly.",
            color: "green",
            colorClass: "bg-green-600",
            widget: {
                type: "exportCards"
            }
        }
    ];

    return (
        <section ref={containerRef} className="w-full bg-white py-32 relative">
            <div className="mx-auto max-w-7xl px-6">
                {/* Main Heading */}
                <div className="mb-16">
                    <h2 className="text-[72px] font-bold text-gray-900 leading-tight">
                        <span className="block">Stunning content</span>
                        <span className="block">in just four steps</span>
                    </h2>
                </div>

                {/* Steps Grid with Stack Animation */}
                <div className="relative space-y-12">
                    {steps.map((step, index) => {
                        // Calculate scroll progress for each card
                        // Each card animates as it scrolls through viewport
                        const startOffset = index * 0.2;
                        const cardProgress = useTransform(
                            scrollYProgress,
                            [
                                startOffset - 0.05,
                                startOffset + 0.1,
                                startOffset + 0.3,
                                startOffset + 0.5
                            ],
                            [0, 0.2, 1, 1]
                        );

                        // Scale animation - cards get smaller as they scroll back (more pronounced)
                        const scale = useTransform(cardProgress, [0, 1], [1, 0.75]);

                        // Y position - cards move backward (reduced to prevent overlap)
                        const y = useTransform(cardProgress, [0, 1], [0, 40]);

                        // Opacity - cards fade as they go back
                        const opacity = useTransform(cardProgress, [0, 1], [1, 0.5]);

                        // Z-index: earlier cards should always be on top when both are visible
                        // Use static z-index based on index to maintain proper stacking order
                        const zIndexValue = 10 - index;

                        // Shadow class based on index (cards earlier in sequence have stronger shadows)
                        const shadowClass = index === 0 ? 'shadow-xl' : index === 1 ? 'shadow-lg' : 'shadow-md';

                        return (
                            <motion.div
                                key={index}
                                style={{
                                    scale,
                                    y,
                                    opacity,
                                    zIndex: zIndexValue
                                }}
                                className={`relative rounded-2xl bg-gray-50 p-12 overflow-hidden ${shadowClass}`}
                            >
                                {/* Grid Pattern Background */}
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: `
                                            linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
                                            linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)
                                        `,
                                        backgroundSize: '32px 32px'
                                    }}
                                />

                                <div className="relative z-10 flex items-start justify-between gap-12">
                                    {/* Left Side */}
                                    <div className="flex-1">
                                        {/* Step Number */}
                                        <div className="text-[100px] font-bold text-gray-300 leading-none mb-6 -mt-4">
                                            {step.number}
                                        </div>

                                        {/* Action Highlight Box */}
                                        <div className="mb-4 inline-block">
                                            <div className={`${step.colorClass} text-white px-5 py-2.5 rounded font-bold text-base`}>
                                                {step.action}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-700 text-base leading-relaxed max-w-2xl">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Right Side - Widgets */}
                                    <div className="flex-shrink-0">
                                        {step.widget?.type === "record" && (
                                            <div className="bg-white rounded-xl shadow-md p-5 flex items-center gap-4 min-w-[300px] border border-gray-100">
                                                {/* Red Circular Icon */}
                                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <div className="w-5 h-5 bg-white rounded-full"></div>
                                                </div>

                                                {/* Text and Timer */}
                                                <div className="flex-1 flex items-center justify-between">
                                                    <div className="text-gray-900 font-semibold text-sm">
                                                        {step.widget.text}
                                                    </div>
                                                    <div className="text-gray-400 text-sm font-medium">
                                                        {step.widget.timer}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {step.widget?.type === "sparkle" && (
                                            <div className="bg-white rounded-full shadow-md w-16 h-16 flex items-center justify-center border border-gray-100">
                                                {/* Magenta Sparkle Icon */}
                                                <svg
                                                    className="w-8 h-8 text-pink-600"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                >
                                                    <path d="M12 2L13.09 8.26L20 9.27L14 14.14L15.18 21.02L12 17.77L8.82 21.02L10 14.14L4 9.27L10.91 8.26L12 2Z" />
                                                </svg>
                                            </div>
                                        )}

                                        {step.widget?.type === "slider" && (
                                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 min-w-[320px]">
                                                {/* Slider Container */}
                                                <div className="relative pt-4">
                                                    {/* Blue Track */}
                                                    <div className="h-2 bg-blue-600 rounded-full w-full"></div>

                                                    {/* White Handle */}
                                                    <div className="absolute top-[calc(50%+2px)] left-[60%] -translate-y-1/2 -translate-x-1/2">
                                                        <div className="w-6 h-6 bg-white rounded-full shadow-md border-2 border-blue-600"></div>
                                                    </div>

                                                    {/* Cursor Icon positioned over handle */}
                                                    <div className="absolute top-0 left-[60%] -translate-x-1/2">
                                                        <svg
                                                            className="w-6 h-6 text-gray-900"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {step.widget?.type === "exportCards" && (
                                            <div className="relative flex items-center" style={{ width: '140px', height: '100px' }}>
                                                {/* Left Card - Code Icon */}
                                                <div className="absolute left-0 bg-white rounded-lg shadow-md flex items-center justify-center border border-gray-100 transform rotate-[-8deg] z-0" style={{ width: '56px', height: '72px' }}>
                                                    <svg
                                                        className="w-5 h-5 text-gray-700"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
                                                    </svg>
                                                </div>

                                                {/* Middle Card - Download/MP4 (Most Prominent) */}
                                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center border border-gray-100 z-10" style={{ width: '72px', height: '88px' }}>
                                                    {/* Download Icon */}
                                                    <svg
                                                        className="w-5 h-5 text-gray-700 mb-1.5"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                                    </svg>

                                                    {/* MP4 Text */}
                                                    <div className="text-[10px] font-semibold text-gray-900 mb-3">MP4</div>

                                                    {/* Green Checkmark Circle at Bottom */}
                                                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                                                        <svg
                                                            className="w-2.5 h-2.5 text-white"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                        >
                                                            <path d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Right Card - Share Icon */}
                                                <div className="absolute right-0 bg-white rounded-lg shadow-md flex items-center justify-center border border-gray-100 transform rotate-[8deg] z-0" style={{ width: '56px', height: '72px' }}>
                                                    <svg
                                                        className="w-5 h-5 text-gray-700"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <circle cx="18" cy="5" r="3" />
                                                        <circle cx="6" cy="12" r="3" />
                                                        <circle cx="18" cy="19" r="3" />
                                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// Translation Demo Section Component with Interactive Languages
function TranslationDemoSection() {
    const [selectedLanguage, setSelectedLanguage] = useState(0);

    const languages = [
        {
            flag: '🇬🇧',
            name: 'English',
            videoTitle: 'How to Book',
            videoSubtitle: 'an Airbnb',
            guideTitle: 'How to Book an Airbnb',
            steps: [
                'From the website home, search for your desired destination and dates.',
                'Browse through available properties and select one that matches your preferences.',
                'Review the property details, amenities, and reviews from previous guests.',
                'Click the "Reserve" button and complete your booking with payment information.'
            ]
        },
        {
            flag: '🇪🇸',
            name: 'Spanish',
            videoTitle: 'Cómo Reservar',
            videoSubtitle: 'un Airbnb',
            guideTitle: 'Cómo Reservar un Airbnb',
            steps: [
                'Desde la página de inicio, busque su destino y fechas deseadas.',
                'Explore las propiedades disponibles y seleccione una que coincida con sus preferencias.',
                'Revise los detalles de la propiedad, las comodidades y las reseñas de huéspedes anteriores.',
                'Haga clic en el botón "Reservar" y complete su reserva con la información de pago.'
            ]
        },
        {
            flag: '🇩🇪',
            name: 'German',
            videoTitle: 'Wie man bucht',
            videoSubtitle: 'ein Airbnb',
            guideTitle: 'Wie man ein Airbnb bucht',
            steps: [
                'Suchen Sie auf der Startseite nach Ihrem gewünschten Ziel und Datum.',
                'Durchsuchen Sie verfügbare Unterkünfte und wählen Sie eine aus, die Ihren Vorlieben entspricht.',
                'Überprüfen Sie die Objektdetails, Annehmlichkeiten und Bewertungen früherer Gäste.',
                'Klicken Sie auf die Schaltfläche "Reservieren" und schließen Sie Ihre Buchung mit Zahlungsinformationen ab.'
            ]
        },
        {
            flag: '🇯🇵',
            name: 'Japanese',
            videoTitle: '予約方法',
            videoSubtitle: 'Airbnb',
            guideTitle: 'Airbnbの予約方法',
            steps: [
                'ウェブサイトのホームから、希望の目的地と日付を検索します。',
                '利用可能な物件を閲覧し、好みに合ったものを選択します。',
                '物件の詳細、設備、以前のゲストのレビューを確認します。',
                '「予約」ボタンをクリックし、支払い情報で予約を完了します。'
            ]
        },
        {
            flag: '🇮🇳',
            name: 'Hindi',
            videoTitle: 'कैसे बुक करें',
            videoSubtitle: 'एक Airbnb',
            guideTitle: 'Airbnb कैसे बुक करें',
            steps: [
                'वेबसाइट होम से, अपने इच्छित गंतव्य और तिथियों की खोज करें।',
                'उपलब्ध संपत्तियों को ब्राउज़ करें और अपनी प्राथमिकताओं से मेल खाने वाली एक का चयन करें।',
                'संपत्ति विवरण, सुविधाओं और पिछले मेहमानों की समीक्षाओं की समीक्षा करें।',
                '"रिज़र्व" बटन पर क्लिक करें और भुगतान जानकारी के साथ अपनी बुकिंग पूरी करें।'
            ]
        },
        {
            flag: '🇸🇦',
            name: 'Arabic',
            videoTitle: 'كيفية الحجز',
            videoSubtitle: 'Airbnb',
            guideTitle: 'كيفية حجز Airbnb',
            steps: [
                'من الصفحة الرئيسية للموقع، ابحث عن وجهتك وتواريخك المطلوبة.',
                'تصفح العقارات المتاحة واختر واحدة تتناسب مع تفضيلاتك.',
                'راجع تفاصيل العقار والمرافق ومراجعات الضيوف السابقين.',
                'انقر فوق زر "احجز" وأكمل حجزك بمعلومات الدفع.'
            ]
        }
    ];

    const currentLang = languages[selectedLanguage];

    return (
        <section className="w-full bg-white py-32">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-sm font-bold tracking-widest text-pink-500 uppercase">Translate</span>
                    </div>
                    <h2 className="text-6xl font-bold text-gray-900 mb-4">
                        Hola. Hallo. <span className="font-normal">こんにちは</span>. <span className="font-normal">नमस्ते</span>.
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Make the world your audience. Translate your voiceover, captions, and documentation in one click.
                    </p>

                    {/* Language Selector */}
                    <div className="flex flex-wrap gap-3">
                        {languages.map((lang, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedLanguage(index)}
                                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${selectedLanguage === index
                                    ? 'border-pink-500 bg-pink-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="text-sm font-medium text-gray-700">{lang.name}</span>
                            </button>
                        ))}
                        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-500">
                            +31 More Languages
                        </button>
                    </div>
                </div>

                {/* Two Column Layout - Video Demo + Guide */}
                <div className="flex gap-8">
                    {/* Left - Video Player (780x440px) */}
                    <div className="flex-shrink-0" style={{ width: '780px', height: '440px' }}>
                        <div className="w-full h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="relative w-full h-full bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
                                {/* Airbnb Logo */}
                                <div className="absolute top-8 left-8">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="#FF5A5F">
                                            <path d="M16 1c-1.2 0-2.2.4-3 1.2-.8.8-1.2 1.8-1.2 3s.4 2.2 1.2 3c.8.8 1.8 1.2 3 1.2s2.2-.4 3-1.2c.8-.8 1.2-1.8 1.2-3s-.4-2.2-1.2-3c-.8-.8-1.8-1.2-3-1.2z" />
                                        </svg>
                                        <span className="text-2xl font-bold text-red-500">airbnb</span>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="text-center z-10 mb-20">
                                    <h3 className="text-6xl font-bold text-gray-900 mb-2">{currentLang.videoTitle}</h3>
                                    <h3 className="text-6xl font-bold text-red-500">{currentLang.videoSubtitle}</h3>
                                </div>

                                {/* Reserve Button */}
                                <div className="absolute bottom-32 left-8">
                                    <button className="px-8 py-4 bg-red-500 text-white font-semibold rounded-lg text-lg shadow-lg">
                                        Reserve
                                    </button>
                                </div>

                                {/* Beach House Image Placeholder */}
                                <div className="absolute bottom-0 right-0 w-3/5 h-3/5 bg-gradient-to-br from-amber-200 via-orange-200 to-pink-200 rounded-tl-[100px]">
                                    {/* Decorative elements for beach house */}
                                    <div className="absolute top-10 left-10 w-32 h-32 bg-amber-300 rounded-full opacity-40"></div>
                                    <div className="absolute top-20 right-20 w-24 h-24 bg-orange-300 rounded-full opacity-40"></div>
                                </div>

                                {/* Video Controls Bar */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-24 flex items-end p-4">
                                    <div className="w-full flex items-center gap-4">
                                        {/* Play Button */}
                                        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5 text-black ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </button>

                                        {/* Time */}
                                        <span className="text-white text-sm font-medium">01:08</span>

                                        {/* Progress Bar */}
                                        <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: '35%' }}></div>
                                        </div>

                                        {/* Volume and Fullscreen */}
                                        <button className="text-white hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                                            </svg>
                                        </button>
                                        <button className="text-white hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Scrollable Guide (380x438px) */}
                    <div className="flex-shrink-0" style={{ width: '380px', height: '438px' }}>
                        <div className="w-full h-full bg-gray-50 rounded-2xl border border-gray-200 p-6 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">{currentLang.guideTitle}</h3>

                            <div className="space-y-6">
                                {currentLang.steps.map((step, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-700 leading-relaxed mb-3">{step}</p>
                                            {/* Screenshot mockup */}
                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 p-2">
                                                    {/* Airbnb interface mockup */}
                                                    <div className="grid grid-cols-3 gap-1 h-full">
                                                        <div className="bg-white rounded shadow-sm"></div>
                                                        <div className="bg-white rounded shadow-sm"></div>
                                                        <div className="bg-white rounded shadow-sm"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Polish the Visuals Section Component
function PolishVisualsSection() {
    return (
        <section className="w-full bg-white pt-0 pb-12">
            <div className="mx-auto max-w-7xl px-6">
                {/* Pink Container Card */}
                <div className="bg-pink-50/50 rounded-[32px] p-12 border border-pink-100/50 relative overflow-hidden">
                    {/* Diagonal Pattern Background */}
                    <div
                        className="absolute inset-0 opacity-30 pointer-events-none"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 8px,
                                rgba(236, 72, 153, 0.15) 8px,
                                rgba(236, 72, 153, 0.15) 16px
                            )`
                        }}
                    />

                    <div className="relative z-10 mb-12">
                        <h2 className="text-2xl font-medium text-pink-500 mb-2">Polish the Visuals</h2>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Card 1: Make It Pop */}
                        <div className="bg-white rounded-2xl p-12 flex flex-col justify-between h-[500px] hover:shadow-xl transition-shadow border border-white hover:border-pink-100 group/card">
                            <div className="flex-1 flex items-center justify-center">
                                {/* Visual: 3D Box with "All" label popping out */}
                                <div className="relative transform group-hover/card:scale-105 transition-transform duration-500">
                                    <div className="w-48 h-16 border border-gray-200 rounded-lg flex items-center justify-center text-gray-300 text-lg transform skew-x-12 bg-white/50 absolute top-0 left-0 -z-10 blur-[1px]">All</div>
                                    <div className="w-48 h-16 border border-gray-200 rounded-lg flex items-center justify-center text-gray-300 text-lg transform skew-x-12 translate-x-16 translate-y-4 bg-white/50 absolute top-0 left-0 -z-10 blur-[1px]">Design</div>
                                    <div className="w-32 h-32 border-2 border-green-400 rounded-xl bg-green-50/20 backdrop-blur-sm flex items-center justify-center relative transform -rotate-12 shadow-lg z-10 transition-transform group-hover/card:-translate-y-2 duration-500">
                                        <span className="text-2xl font-bold text-gray-800">All</span>
                                        {/* Green 3D effect lines */}
                                        <div className="absolute top-0 right-0 w-4 h-[calc(100%+8px)] border-r border-green-400 transform skew-y-[45deg] origin-top-right translate-x-4 -translate-y-2"></div>
                                        <div className="absolute top-0 left-0 w-[calc(100%+8px)] h-4 border-t border-green-400 transform skew-x-[45deg] origin-top-left -translate-y-4"></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Make It Pop</h3>
                                <p className="text-lg text-gray-500">Draw instant attention to any part of your video.</p>
                            </div>
                        </div>

                        {/* Card 2: Mask with Blurs */}
                        <div className="bg-white rounded-2xl p-12 flex flex-col justify-between h-[500px] hover:shadow-xl transition-shadow border border-white hover:border-pink-100 group/card">
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-xl text-gray-400 font-medium">
                                    My bank account number is <span className="blur-md select-none text-gray-800 group-hover/card:blur-none transition-all duration-700 cursor-pointer">34298385321</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Mask with Blurs</h3>
                                <p className="text-lg text-gray-500">Blur unwanted or sensitive details from your video.</p>
                            </div>
                        </div>

                        {/* Card 3: Resize for any Aspect Ratio */}
                        <div className="bg-white rounded-2xl p-12 flex flex-col justify-between h-[500px] hover:shadow-xl transition-shadow border border-white hover:border-pink-100 group/card">
                            <div className="flex-1 flex items-center justify-center gap-4">
                                {/* Desktop */}
                                <div className="w-48 h-32 border-2 border-gray-100 rounded-lg bg-white shadow-sm flex items-center justify-center relative group-hover/card:scale-105 transition-transform duration-500 delay-75">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 absolute top-2 left-2"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 absolute top-2 left-5"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 absolute top-2 left-8"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-200/50 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                                {/* Mobile */}
                                <div className="w-16 h-32 border-2 border-gray-100 rounded-lg bg-white shadow-sm flex items-center justify-center mb-8 group-hover/card:scale-105 transition-transform duration-500">
                                    <div className="w-10 h-1 bg-gray-100 rounded-full absolute top-2"></div>
                                    <div className="w-6 h-6 rounded-full bg-gray-200/50 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Resize for any Aspect Ratio</h3>
                                <p className="text-lg text-gray-500">Easily resize your videos for demos, shorts, laptops, or mobile screens.</p>
                            </div>
                        </div>

                        {/* Card 4: Brand-Aid */}
                        <div className="bg-white rounded-2xl p-12 flex flex-col justify-between h-[500px] hover:shadow-xl transition-shadow border border-white hover:border-pink-100 group/card">
                            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                                {/* Typography Aa */}
                                <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-6 transform -rotate-6 group-hover/card:rotate-0 transition-transform duration-500">
                                    <span className="text-6xl font-serif text-gray-800">Aa</span>
                                </div>
                                {/* Color Palette */}
                                <div className="bg-white border border-gray-100 shadow-md rounded-full px-6 py-3 flex items-center gap-3 transform group-hover/card:translate-y-2 transition-transform duration-500">
                                    <div className="w-8 h-8 rounded-full bg-green-500 hover:scale-110 transition-transform"></div>
                                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-200 ring-2 ring-blue-100 hover:scale-110 transition-transform"></div>
                                    <div className="w-8 h-8 rounded-full bg-orange-500 hover:scale-110 transition-transform"></div>
                                    <div className="w-8 h-8 rounded-full bg-pink-500 hover:scale-110 transition-transform"></div>
                                    <div className="w-8 h-8 rounded-full bg-red-500 hover:scale-110 transition-transform"></div>
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:scale-110 transition-transform"></div>
                                    <div className="w-8 h-8 rounded-full bg-black hover:scale-110 transition-transform"></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Brand-Aid</h3>
                                <p className="text-lg text-gray-500">Drop in your fonts, colors, and logos once, and every video stays perfectly on-brand.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Tweak the Documentation Section Component
function TweakDocumentationSection() {
    return (
        <section className="w-full bg-white pt-0 pb-24">
            <div className="mx-auto max-w-7xl px-6">
                {/* Green Container Card */}
                <div className="bg-green-50/50 rounded-[32px] p-12 border border-green-100/50 relative overflow-hidden">
                    {/* Diagonal Pattern Background */}
                    <div
                        className="absolute inset-0 opacity-30 pointer-events-none"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 8px,
                                rgba(34, 197, 94, 0.1) 8px,
                                rgba(34, 197, 94, 0.1) 16px
                            )`
                        }}
                    />

                    <div className="relative z-10 mb-12">
                        <h2 className="text-2xl font-medium text-green-500 mb-2">Tweak the Documentation</h2>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Card 1: Articles Written Your Way */}
                        <div className="bg-white rounded-2xl p-12 flex flex-col justify-between h-[500px] hover:shadow-xl transition-shadow border border-white hover:border-green-100 group/card">
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                {/* Visual: Guidelines pills */}
                                <div className="bg-red-50 text-red-800 px-6 py-4 rounded-full flex items-center gap-3 w-full max-w-sm transform -rotate-1 group-hover/card:rotate-0 transition-transform shadow-sm">
                                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                    </div>
                                    <span className="text-sm font-medium">Avoid phrases like "you can" and "there is."</span>
                                </div>
                                <div className="bg-green-50 text-green-800 px-6 py-4 rounded-full flex items-center gap-3 w-full max-w-sm shadow-md transform translate-x-4 group-hover/card:translate-x-0 transition-transform">
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-sm font-medium">Begin each instruction with "Step" followed by the step number.</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Articles Written Your Way</h3>
                                <p className="text-lg text-gray-500">Set your guidelines once, and Clueso AI generates articles exactly how you prefer.</p>
                            </div>
                        </div>

                        {/* Card 2: Built-In Screenshot Editor */}
                        <div className="bg-white rounded-2xl p-12 flex flex-col justify-between h-[500px] hover:shadow-xl transition-shadow border border-white hover:border-green-100 group/card">
                            <div className="flex-1 flex flex-col items-center justify-center">
                                {/* Visual: Toolbar */}
                                <div className="flex items-center gap-3 bg-white p-2 rounded-xl">
                                    <div className="w-12 h-12 rounded-lg bg-gray-500 flex items-center justify-center shadow-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center shadow-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
                                    </div>
                                    <div className="w-16 h-16 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg transform -translate-y-2">
                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center shadow-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10h6v6" /></svg>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-gray-500 flex items-center justify-center shadow-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                    </div>
                                </div>
                                <div className="mt-4 text-gray-300 font-medium">Crop</div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Built-In Screenshot Editor</h3>
                                <p className="text-lg text-gray-500">Zoom, crop, blur, or annotate screenshots directly in your article.</p>
                            </div>
                        </div>

                        {/* Card 3: GIF It */}
                        <div className="bg-white rounded-2xl p-12 flex flex-col justify-between h-[500px] hover:shadow-xl transition-shadow border border-white hover:border-green-100 group/card">
                            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
                                {/* Visual: Timeline */}
                                <div className="w-full relative h-32 flex items-center justify-center">
                                    {/* Ruler marks */}
                                    <div className="absolute top-0 w-full flex justify-between px-2">
                                        {[...Array(9)].map((_, i) => (
                                            <div key={i} className={`w-px bg-gray-200 ${i % 2 === 0 ? 'h-4' : 'h-2'}`}></div>
                                        ))}
                                    </div>
                                    {/* Time labels */}
                                    <div className="absolute top-6 w-full flex justify-between px-0 text-xs text-gray-300 font-mono">
                                        <span>5s</span>
                                        <span>10s</span>
                                        <span>15s</span>
                                        <span>20s</span>
                                        <span>25s</span>
                                    </div>
                                    {/* GIF Block */}
                                    <div className="absolute top-1/2 -translate-y-1/2 bg-gray-100 border-2 border-gray-300 rounded-lg w-48 h-20 flex items-center justify-center shadow-inner group-hover/card:scale-105 transition-transform z-10">
                                        <span className="text-2xl font-light text-gray-400 tracking-widest">GIF</span>
                                        {/* Playhead line */}
                                        <div className="absolute -top-12 bottom-full w-px bg-blue-500 h-[200%] left-8 flex flex-col items-center">
                                            <div className="w-3 h-3 bg-blue-500 rounded-b-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">GIF It</h3>
                                <p className="text-lg text-gray-500">Convert any screenshot to an animated GIF with just a click.</p>
                            </div>
                        </div>

                        {/* Card 4: Article Co-pilot */}
                        <div className="bg-white rounded-2xl p-12 flex flex-col justify-between h-[500px] hover:shadow-xl transition-shadow border border-white hover:border-green-100 group/card">
                            <div className="flex-1 flex flex-col items-center justify-center w-full">
                                {/* Visual: Chat Input */}
                                <div className="w-full bg-gray-50 rounded-xl p-2 flex items-center gap-3 border border-gray-100 shadow-sm group-hover/card:shadow-md transition-shadow">
                                    <div className="pl-3">
                                        <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 6 6.5 11.5 1 14l5.5 2.5L9 22l2.5-5.5L17 14l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" /></svg>
                                    </div>
                                    <div className="flex-1 text-gray-400 text-lg">Ask AI to improve your article</div>
                                    <div className="bg-pink-500 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-3">Article Co-pilot</h3>
                                <p className="text-lg text-gray-500">Give instructions via chat, and Clueso AI edits your article instantly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Security Section Component
function SecuritySection() {
    return (
        <section className="w-full bg-white pt-0 pb-24">
            <div className="mx-auto max-w-7xl px-6">
                {/* Gray Container Card */}
                <div className="bg-gray-50/80 rounded-[32px] p-24 relative overflow-hidden flex flex-col items-center text-center">
                    {/* Background Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Radial Gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 pointer-events-none"></div>

                    {/* Shield Logo */}
                    <div className="relative mb-12">
                        {/* Glow effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/20 rounded-full blur-[64px]"></div>

                        <div className="relative w-40 h-48 drop-shadow-2xl">
                            <svg viewBox="0 0 100 120" fill="none" className="w-full h-full text-emerald-500">
                                <path d="M50 0L95 15V55C95 85 75 110 50 120C25 110 5 85 5 55V15L50 0Z" fill="currentColor" />
                                <path d="M50 0L95 15V55C95 85 75 110 50 120C25 110 5 85 5 55V15L50 0Z" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-inner">
                                    <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4m12-6L8 18m8 0L8 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">Always Create Securely</h2>
                    <p className="text-xl text-gray-500 max-w-3xl mx-auto mb-16 leading-relaxed">
                        We don't use your data to train our models. Each feature is designed to be privacy-first,
                        so you can be assured that you only focus on creating and not worrying.
                    </p>

                    <div className="flex flex-col md:flex-row items-center gap-12 bg-white/50 p-8 rounded-2xl border border-gray-100 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            {/* AICPA Badge Approximation */}
                            <div className="w-20 h-20 rounded-full bg-blue-500 border-4 border-white shadow-lg flex flex-col items-center justify-center text-white p-1 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600"></div>
                                <span className="relative text-[10px] font-bold uppercase tracking-wider">AICPA</span>
                                <span className="relative text-xs font-bold leading-tight">SOC</span>
                                <div className="absolute bottom-0 w-full h-1/2 bg-white/10 skew-y-6 transform translate-y-2"></div>
                            </div>

                            {/* ISO Badge Approximation */}
                            <div className="w-20 h-20 rounded-full bg-blue-500 border-4 border-white shadow-lg flex flex-col items-center justify-center text-white p-1 text-center relative overflow-hidden group -ml-6 md:ml-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600"></div>
                                <span className="relative text-[10px] font-bold uppercase tracking-wider">ISO</span>
                                <span className="relative text-xs font-bold leading-tight">27001</span>
                                <div className="absolute bottom-0 w-full h-1/2 bg-white/10 skew-y-6 transform translate-y-2"></div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-lg font-medium text-gray-800">SOC 2 Type II certified</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-lg font-medium text-gray-800">ISO 27001 certified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// FAQ Section Component
function FAQSection() {
    const faqs = [
        {
            question: "What is Clueso?",
            answer: "Clueso is an AI-powered documentation tool that helps you create beautiful, engaging, and secure documentation and video tutorials in minutes. It automatically turns your screen recordings into step-by-step guides."
        },
        {
            question: "How does Clueso keep my data secure?",
            answer: "Security is our top priority. We are SOC 2 Type II and ISO 27001 certified. We do not use your data to train our models, and all data is encrypted in transit and at rest."
        },
        {
            question: "What export formats does Clueso support?",
            answer: "You can export your documentation as PDF, HTML, Markdown, or embed it directly into your existing knowledge base or website."
        },
        {
            question: "Can I collaborate with my team on Clueso?",
            answer: "Yes! Clueso is built for teams. You can invite team members, assign roles, leave comments, and collaborate on documentation in real-time."
        },
        {
            question: "Where can I see more customer reviews of Clueso?",
            answer: "You can check out our reviews on G2, Capterra, and Product Hunt to see what our customers have to say about us."
        },
        {
            question: "Can I try Clueso before purchasing?",
            answer: "Absolutely. We offer a 14-day free trial with full access to all features so you can experience the power of Clueso before committing."
        },
        {
            question: "What kind of support do you offer?",
            answer: "We offer 24/7 email support, a comprehensive help center, and dedicated account managers for our Enterprise plans."
        },
        {
            question: "Who is Clueso for?",
            answer: "Clueso is for anyone who needs to create documentation, tutorials, or training materials. It's perfect for Customer Success, Support, Product, and HR teams."
        }
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="w-full bg-white pt-12 pb-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col md:flex-row gap-16">
                    {/* Left Column: Title */}
                    <div className="md:w-1/3">
                        <h2 className="text-6xl font-medium tracking-tight text-gray-900 leading-tight">
                            Frequently<br />Asked<br />Questions
                        </h2>
                    </div>

                    {/* Right Column: Accordion */}
                    <div className="md:w-2/3">
                        <div className="divide-y divide-gray-100">
                            {faqs.map((faq, index) => (
                                <div key={index} className="py-6">
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        className="flex items-center justify-start w-full text-left group gap-6"
                                    >
                                        <span className={`flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`}>
                                            <svg className="w-6 h-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </span>
                                        <span className="text-lg font-medium text-gray-900 group-hover:text-pink-600 transition-colors">{faq.question}</span>
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
                                    >
                                        <p className="text-gray-600 leading-relaxed pr-12">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// CTA Section Component
function CTASection() {
    return (
        <section className="w-full bg-white pt-0 pb-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="relative w-full rounded-[32px] overflow-hidden bg-[#5EA5F2]">
                    <div className="flex flex-col md:flex-row items-center h-[500px]">
                        {/* Text Content */}
                        <div className="w-full md:w-1/2 p-16 md:pr-0 z-10">
                            <h2 className="text-6xl font-medium tracking-tight text-white mb-6 leading-tight">
                                Start making<br />beautiful videos
                            </h2>
                            <p className="text-xl text-blue-100 max-w-md mb-10 leading-relaxed">
                                Transform rough screen recordings into stunning videos & documentation.
                            </p>
                            <button className="bg-[#E959B4] text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-[#D645A2] transition-colors shadow-lg shadow-pink-500/20">
                                Begin Now
                            </button>
                        </div>

                        {/* Image */}
                        <div className="absolute top-0 right-0 w-full md:w-2/3 h-full">
                            <div className="relative w-full h-full">
                                <Image
                                    src="/cherry-blossom.png"
                                    alt="Cherry Blossom Tree"
                                    fill
                                    className="object-cover object-right"
                                    priority
                                />
                                {/* Gradient Overlay to blend image with blue background on the left */}
                                <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#5EA5F2] to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}



// Footer Section Component
function FooterSection() {
    const productLinks = [
        "Pricing", "Video", "Documentation", "Translate", "AI Voiceovers", "Slides to Video", "Changelog"
    ];

    const resourcesLinks = [
        "Blog", "Help Center", "Customers", "Tutorials", "Affiliate Program", "Careers at Clueso"
    ];

    const freeToolsLinks = [
        "Video Caption Generator", "Video Subtitle Generator", "Video Translator",
        "Add AI Voiceover to Video", "PDF to Video Converter", "Video to GIF Converter"
    ];

    const compareLinks = [
        "Clueso vs Camtasia", "Clueso vs Loom", "Clueso vs Synthesia", "Clueso vs Descript",
        "Clueso vs Scribe", "Clueso vs Guidde", "Clueso vs Vyond", "Clueso vs Tango",
        "Clueso vs HeyGen", "Clueso vs Veed"
    ];

    const buyersGuideLinks = [
        "Best Screen Recording Software", "Best Screen Capture Software", "Best Documentation Software",
        "Best Product Walkthrough Software", "Best SOP Creation Software", "Best Training Video Software",
        "Best Onboarding Software", "Best Video Editing Software", "Best Learning Management Systems"
    ];

    return (
        <footer className="w-full bg-white pt-20 pb-24 border-t border-gray-100">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
                    {/* Column 1: Brand & Socials */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-pink-600">
                                    <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">Clueso</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* LinkedIn */}
                            <a href="#" className="p-2 text-gray-400 hover:text-gray-600 transition-colors border border-gray-100 rounded-md">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </a>
                            {/* X / Twitter */}
                            <a href="#" className="p-2 text-gray-400 hover:text-gray-600 transition-colors border border-gray-100 rounded-md">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            {/* YouTube */}
                            <a href="#" className="p-2 text-gray-400 hover:text-gray-600 transition-colors border border-gray-100 rounded-md">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Product */}
                    <div className="lg:col-span-1">
                        <h3 className="font-semibold text-gray-900 mb-6">Product</h3>
                        <ul className="space-y-4">
                            {productLinks.map(link => (
                                <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Resources & Free Tools */}
                    <div className="lg:col-span-1 flex flex-col gap-10">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-6">Resources</h3>
                            <ul className="space-y-4">
                                {resourcesLinks.map((link, i) => (
                                    <li key={i}>
                                        <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2">
                                            {link}
                                            {link === "Video glossary" && (
                                                <span className="bg-[#D946EF] text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">New</span>
                                            )}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-6">Free Tools</h3>
                            <ul className="space-y-4">
                                {freeToolsLinks.map(link => (
                                    <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{link}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Column 4: Compare */}
                    <div className="lg:col-span-1">
                        <h3 className="font-semibold text-gray-900 mb-6">Compare</h3>
                        <ul className="space-y-4">
                            {compareLinks.map(link => (
                                <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 5: Buyer's Guide (Spans 2 cols to avoid wrapping text too much or just 1 col generous) */}
                    <div className="lg:col-span-2">
                        <h3 className="font-semibold text-gray-900 mb-6">Buyer's Guide</h3>
                        <ul className="space-y-4">
                            {buyersGuideLinks.map(link => (
                                <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function LandingPage() {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-[#1a1a1a] selection:bg-clueso-pink/20">
            {/* Header Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-50 h-20 flex items-center">
                <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group" onMouseEnter={() => setActiveMenu(null)}>
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute w-5 h-5 bg-clueso-pink rotate-45 -translate-x-1 -translate-y-1 rounded-[2px]"></div>
                            <div className="absolute w-5 h-5 bg-clueso-pink opacity-50 rotate-45 translate-x-1 translate-y-1 rounded-[2px]"></div>
                        </div>
                        <span className="font-bold text-[22px] tracking-tight text-[#1a1a1a]">Clueso</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden lg:flex items-center gap-10">
                        <div
                            className="relative py-8"
                            onMouseEnter={() => setActiveMenu('product')}
                            onMouseLeave={() => setActiveMenu(null)}
                        >
                            <div className={`flex items-center gap-1.5 cursor-pointer transition-colors group ${activeMenu === 'product' ? 'text-clueso-pink' : ''}`}>
                                <span className={`text-[15px] font-semibold ${activeMenu === 'product' ? 'text-clueso-pink' : 'text-gray-700'}`}>Product</span>
                                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'product' ? 'rotate-180 text-clueso-pink' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                            </div>

                            {/* Product Mega Menu Dropdown */}
                            {activeMenu === 'product' && (
                                <div className="absolute top-full left-0 w-[640px] bg-white rounded-2xl shadow-[0_32px_120px_-15px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden animate-slide-up origin-top">
                                    <div className="flex p-6 gap-8">
                                        {/* Capabilities Column */}
                                        <div className="flex-1 space-y-6">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Capabilities</p>
                                            <div className="space-y-4">
                                                <MenuListItem
                                                    icon={<VideoIcon />}
                                                    title="Videos"
                                                    desc="Studio style videos for any product"
                                                />
                                                <MenuListItem
                                                    icon={<DocIcon />}
                                                    title="Documentation"
                                                    desc="Step by step articles with screenshots"
                                                />
                                            </div>

                                            {/* Changelog Card */}
                                            <div className="mt-8 bg-gray-50/50 rounded-2xl p-5 relative overflow-hidden group/card cursor-pointer border border-gray-100 hover:border-clueso-pink/20 transition-colors">
                                                <div className="relative z-10 max-w-[160px]">
                                                    <h4 className="text-[15px] font-black mb-1">Changelog</h4>
                                                    <p className="text-gray-500 text-[12px] font-medium leading-tight">See what's new in Clueso</p>
                                                </div>
                                                <img
                                                    src="/clueso-assets/megaphone.png"
                                                    alt="Megaphone"
                                                    className="absolute -right-2 -bottom-2 w-32 h-32 object-contain group-hover/card:scale-110 transition-transform duration-500 ease-out"
                                                />
                                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-clueso-pink/40 via-purple-500/40 to-transparent"></div>
                                            </div>
                                        </div>

                                        {/* Features Column */}
                                        <div className="flex-1 space-y-6">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Features</p>
                                            <div className="space-y-4">
                                                <MenuListItem
                                                    icon={<TranslateIcon />}
                                                    title="Translate"
                                                    desc="Translate your videos and docs"
                                                />
                                                <MenuListItem
                                                    icon={<MicIcon />}
                                                    title="AI Voiceovers"
                                                    desc="Translate your videos and docs"
                                                />
                                                <MenuListItem
                                                    icon={<SlidesIcon />}
                                                    title="Slides to video"
                                                    desc="Convert static slides into videos"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            className="relative py-8"
                            onMouseEnter={() => setActiveMenu('resources')}
                            onMouseLeave={() => setActiveMenu(null)}
                        >
                            <div className={`flex items-center gap-1.5 cursor-pointer transition-colors group ${activeMenu === 'resources' ? 'text-clueso-pink' : ''}`}>
                                <span className={`text-[15px] font-semibold ${activeMenu === 'resources' ? 'text-clueso-pink' : 'text-gray-700'}`}>Resources</span>
                                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'resources' ? 'rotate-180 text-clueso-pink' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                            </div>

                            {/* Resources Dropdown */}
                            {activeMenu === 'resources' && (
                                <div className="absolute top-full left-0 w-[320px] bg-white rounded-2xl shadow-[0_32px_120px_-15px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden animate-slide-up origin-top p-2">
                                    <div className="flex flex-col">
                                        <MenuListItemSimple
                                            icon={<PenIcon />}
                                            title="Blog"
                                            desc="Latest news and practical guides"
                                        />
                                        <MenuListItemSimple
                                            icon={<BookIcon />}
                                            title="Help Center"
                                            desc="Learn how to use Clueso"
                                        />
                                        <MenuListItemSimple
                                            icon={<UsersIcon />}
                                            title="Customer Stories"
                                            desc="Hear from our customers"
                                        />
                                        <MenuListItemSimple
                                            icon={<VideoTextIcon />}
                                            title="Video Glossary"
                                            desc="Unhinged list of all things video production"
                                            badge="New"
                                        />
                                        <MenuListItemSimple
                                            icon={<ChatIcon />}
                                            title="FAQs"
                                            desc="Frequently asked questions"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <Link href="#pricing" className="text-[15px] font-semibold text-gray-700 hover:text-clueso-pink transition-colors">Pricing</Link>
                        <Link href="#" className="text-[15px] font-semibold text-gray-700 hover:text-clueso-pink transition-colors">Careers</Link>
                    </div>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-4">
                        <Link href="/sign-in">
                            <button className="px-5 py-2 text-[15px] font-semibold text-gray-700 hover:text-[#1a1a1a] transition-colors border border-gray-100 rounded-lg">
                                Sign In
                            </button>
                        </Link>
                        <Link href="/sign-up">
                            <button className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-lg text-[15px] font-bold hover:bg-black transition-colors">
                                Start Free Trial
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden">
                {/* Hero Background Gradient */}
                <div className="absolute top-0 right-0 w-[70%] h-full pointer-events-none -z-10 select-none overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-100"
                        style={{
                            background: `linear-gradient(135deg, 
                                rgba(255, 255, 255, 1) 0%, 
                                rgba(255, 255, 255, 0.8) 30%, 
                                rgba(244, 114, 182, 0.1) 50%, 
                                rgba(244, 114, 182, 0.4) 70%, 
                                rgba(192, 132, 252, 0.3) 100%
                            )`,
                            filter: 'blur(100px)',
                            transform: 'translate(10%, -10%) skewX(-15deg)',
                        }}
                    />
                    <div
                        className="absolute top-0 right-0 w-[120%] h-[120%] opacity-40"
                        style={{
                            background: 'radial-gradient(circle at 70% 30%, rgba(244, 114, 182, 0.4), transparent 60%)',
                        }}
                    />
                </div>

                <div className="max-w-7xl mx-auto px-10">
                    <div className="max-w-4xl">
                        <h1 className="mb-8" style={{ fontSize: '100px', lineHeight: '1.0', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>
                            <span className="block" style={{ color: '#1a1a1a' }}>Product videos</span>
                            <span className="block text-[#a0a0a0]">in minutes with AI</span>
                        </h1>

                        <p className="text-[20px] text-gray-500 font-medium max-w-2xl mb-12 leading-relaxed">
                            Transform raw screen recordings into stunning videos & documentation.
                        </p>

                        <div className="flex items-center gap-4 mb-24">
                            <Link href="/sign-up">
                                <button className="bg-[#e24fb1] text-white px-8 py-3.5 rounded-lg text-[16px] font-bold hover:brightness-110 transition-all shadow-sm">
                                    Start Free Trial
                                </button>
                            </Link>
                            <button className="bg-white border border-pink-100 text-[#e24fb1] px-8 py-3.5 rounded-lg text-[16px] font-bold hover:bg-pink-50 transition-all">
                                Book a Demo
                            </button>
                        </div>
                    </div>

                    {/* Interactive Video Comparison Slider */}
                    <ComparisonSlider />
                </div>
            </section>

            {/* Trusted by Companies Section */}
            <section className="w-full bg-white py-28">
                <div className="mx-auto max-w-7xl px-6">
                    {/* Trust Strip - Backed by YC + G2 Rating */}
                    <div className="flex items-center justify-center gap-8 mb-16">
                        <div className="h-px flex-1 bg-gray-200 max-w-xs"></div>

                        <div className="flex items-center gap-8 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <span>Backed by</span>
                                <div className="w-5 h-5 bg-orange-500 rounded-sm flex items-center justify-center">
                                    <span className="text-white font-black text-xs">Y</span>
                                </div>
                            </div>

                            <div className="w-px h-4 bg-gray-300"></div>

                            <div className="flex items-center gap-2">
                                <span>Rated 4.9</span>
                                <svg className="w-3.5 h-3.5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>on</span>
                                <span className="text-gray-800 font-semibold">G2.com</span>
                            </div>
                        </div>

                        <div className="h-px flex-1 bg-gray-200 max-w-xs"></div>
                    </div>

                    {/* Logo Grid - 3 rows × 4 columns - Exact Dimensions */}
                    <div className="mx-auto w-[1184px] h-[742px]">
                        <div className="grid grid-cols-4 border-t border-l border-gray-200/50">
                            {/* Row 1 */}
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <span className="text-2xl font-bold text-gray-900 tracking-tight">phenom</span>
                            </div>
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <div className="flex items-center gap-2">
                                    <svg className="w-7 h-7 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    <span className="text-xl font-semibold text-gray-900">samsara</span>
                                </div>
                            </div>
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="3" y="3" width="7" height="7" rx="1" />
                                        <rect x="14" y="3" width="7" height="7" rx="1" />
                                        <rect x="3" y="14" width="7" height="7" rx="1" />
                                        <rect x="14" y="14" width="7" height="7" rx="1" />
                                    </svg>
                                    <span className="text-xl font-bold text-gray-900">smartsheet</span>
                                </div>
                            </div>
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <span className="text-2xl font-bold text-gray-900">Personio</span>
                            </div>

                            {/* Row 2 */}
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xl font-light text-gray-800 tracking-wide">UiPath</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Agentic Automation</span>
                                </div>
                            </div>
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <div className="px-3 py-1.5 bg-gray-900 text-white font-bold text-sm rounded">duda</div>
                            </div>
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <div className="flex items-center gap-1">
                                    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="4" y="4" width="16" height="16" rx="2" />
                                    </svg>
                                    <span className="text-xl font-bold text-gray-900">darwinbox</span>
                                </div>
                            </div>
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <span className="text-base font-bold text-gray-900 tracking-tight">MOVABLE INK</span>
                            </div>

                            {/* Row 3 */}
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <span className="text-xl font-semibold text-gray-900">Keyfactor</span>
                            </div>
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <span className="text-xl font-bold text-gray-900">MoEngage</span>
                            </div>
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <div className="flex items-center gap-2">
                                    <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 2v4m0 12v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M2 12h4m12 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" />
                                    </svg>
                                    <span className="text-lg font-bold text-gray-900">Fireflies.ai</span>
                                </div>
                            </div>
                            <div className="w-[295px] h-[224px] flex items-center justify-center border-b border-r border-gray-200/50">
                                <span className="text-2xl font-bold text-gray-900">Pleo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonial Section with Scroll-Based Reveal */}
            <TestimonialReveal />

            {/* AI Features Section */}
            <section className="w-full bg-white py-32">
                {/* Top Divider */}
                <div className="w-full border-t border-gray-200"></div>

                <div className="mx-auto max-w-7xl px-6 pt-32">
                    {/* Section Header - Left Aligned */}
                    <div className="mb-20">
                        <div className="flex items-center gap-2 mb-6">
                            <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="text-xs font-bold tracking-widest text-pink-500 uppercase">Crafted with AI</span>
                        </div>
                        <h2 className="text-[56px] font-bold text-gray-900 leading-tight mb-6">Major video edits, automated.</h2>
                        <p className="text-lg text-gray-600 max-w-[650px]">
                            AI does the heavy-lifting. The final touches are all yours — everything is customizable.
                        </p>
                    </div>

                    {/* 2-Column Card Layout */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* Perfect Video Scripts Card */}
                        <div className="rounded-2xl border border-gray-200 p-10 bg-white">
                            <div className="mb-8 p-8 bg-gray-50 rounded-xl">
                                {/* Script mockup with filler word highlighting */}
                                <div className="space-y-3 text-sm text-gray-400">
                                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                                    <div className="mt-6 space-y-2">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">Okay so um</span>
                                            <span className="text-gray-700">this new feature</span>
                                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">basically</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="text-gray-700">lets you</span>
                                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">sort of</span>
                                            <span className="text-gray-700">export your data.</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded w-full mt-6"></div>
                                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Perfect Video Scripts</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                AI removes filler words and rewrites your script clearly and concisely, perfectly matching your brand voice.
                            </p>
                        </div>

                        {/* Lifelike AI Voiceovers Card */}
                        <div className="rounded-2xl border border-gray-200 p-10 bg-white">
                            <div className="mb-8 p-8 bg-gray-50 rounded-xl flex items-center justify-center h-[240px]">
                                {/* Waveform visualization */}
                                <div className="flex items-end gap-1 h-32">
                                    {[12, 18, 24, 32, 28, 36, 42, 38, 45, 52, 48, 56, 62, 58, 65, 72, 68, 75, 82, 78, 85, 92, 88, 95, 88, 82, 75, 68, 62, 55, 48, 42, 35, 28, 22, 15].map((height, i) => (
                                        <div
                                            key={i}
                                            className="w-1 rounded-full transition-all"
                                            style={{
                                                height: `${height}px`,
                                                background: i >= 15 && i <= 25 ? 'linear-gradient(to top, #ec4899, #a855f7)' : '#d1d5db'
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Lifelike AI Voiceovers</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                Your recorded audio is swapped with AI voiceovers that sound impressively professional and realistic.
                            </p>
                        </div>
                    </div>

                    {/* Second Row - 2 More Cards */}
                    <div className="grid grid-cols-2 gap-8 mt-8">
                        {/* Smart Auto-Zooms Card */}
                        <div className="rounded-2xl border border-gray-200 p-10 bg-white">
                            <div className="mb-8 p-8 bg-gray-50 rounded-xl relative overflow-hidden h-[240px]">
                                {/* Zoom animation mockup */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        {/* Placeholder lines */}
                                        <div className="space-y-2 mb-6">
                                            <div className="h-2 bg-gray-200 rounded w-64"></div>
                                            <div className="h-2 bg-gray-200 rounded w-48"></div>
                                        </div>
                                        {/* Animated zoom button */}
                                        <motion.div
                                            className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-md inline-block cursor-pointer"
                                            animate={{
                                                scale: [1, 1.05, 1],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            Button
                                        </motion.div>
                                        {/* Cursor indicator */}
                                        <motion.div
                                            className="absolute -right-2 top-12"
                                            animate={{
                                                x: [0, 5, 0],
                                                y: [0, -5, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                                            </svg>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Smart Auto-Zooms</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                AI automatically zooms into key actions, highlighting exactly what viewers need to see.
                            </p>
                        </div>

                        {/* Beautiful Captions Card */}
                        <div className="rounded-2xl border border-gray-200 p-10 bg-white">
                            <div className="mb-8 p-8 bg-gray-50 rounded-xl flex items-center justify-center h-[240px]">
                                {/* Caption animation */}
                                <motion.div
                                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg font-semibold rounded-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        times: [0, 0.2, 0.8, 1]
                                    }}
                                >
                                    Clueso automatically generates captions
                                </motion.div>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Beautiful Captions</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                Instantly engage your viewers with eye-catching, AI-generated captions.
                            </p>
                        </div>
                    </div>

                    {/* Third Row - Final 2 Cards */}
                    <div className="grid grid-cols-2 gap-8 mt-8">
                        {/* Auto-Generated SOPs & How-Tos Card */}
                        <div className="rounded-2xl border border-gray-200 p-10 bg-white">
                            <div className="mb-8 p-8 bg-gray-50 rounded-xl h-[240px] flex items-start justify-start">
                                {/* Document mockup with animated progress */}
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-4">
                                        <motion.div
                                            className="w-3 h-3 bg-emerald-500 rounded-full"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [1, 0.7, 1]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                        <div className="h-1 bg-gray-200 rounded-full flex-1 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-emerald-500"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "linear"
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                                            <div className="h-2 bg-gray-300 rounded w-full mb-2"></div>
                                            <div className="h-2 bg-gray-300 rounded w-4/5"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Auto-Generated SOPs & How-Tos</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                Clear, step-by-step documentation magically created from your videos.
                            </p>
                        </div>

                        {/* Branded Video Templates Card with Gradient Glow */}
                        <div className="rounded-2xl border border-gray-200 p-10 bg-white relative overflow-visible">
                            {/* Vibrant gradient glow effect - positioned absolutely behind card */}
                            <div className="absolute -inset-6 bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400 rounded-3xl blur-3xl opacity-50 -z-10"></div>

                            <div className="mb-8 p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 rounded-xl h-[240px] flex items-center justify-center relative overflow-hidden">
                                {/* Animated gradient overlay */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-pink-200/40 via-purple-200/40 to-orange-200/40"
                                    animate={{
                                        opacity: [0.3, 0.6, 0.3]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                <div className="relative bg-white rounded-lg p-8 shadow-lg">
                                    <motion.div
                                        className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center"
                                        whileHover={{ scale: 1.1 }}
                                        animate={{
                                            boxShadow: [
                                                "0 0 0 0 rgba(156, 163, 175, 0.4)",
                                                "0 0 0 10px rgba(156, 163, 175, 0)",
                                                "0 0 0 0 rgba(156, 163, 175, 0)"
                                            ]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeOut"
                                        }}
                                    >
                                        <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </motion.div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Branded Video Templates</h3>
                            <p className="text-base text-gray-600 leading-relaxed">
                                Keep your videos consistently on brand with themed intros, outros, and backgrounds.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section - Clueso is built for you */}
            <UseCasesSection />

            {/* CTA Section - Experience it yourself */}
            <section className="w-full bg-white py-32">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="relative rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 px-16 py-24 overflow-hidden">
                        {/* Colorful Clueso Logo */}
                        <div className="flex justify-center mb-8">
                            <div className="flex items-center gap-1">
                                {/* Rainbow gradient bars */}
                                <div className="w-3 h-12 bg-gradient-to-b from-red-500 to-pink-500 rounded-full transform -skew-x-12"></div>
                                <div className="w-3 h-12 bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full transform -skew-x-12"></div>
                                <div className="w-3 h-12 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full transform -skew-x-12"></div>
                                <div className="w-3 h-12 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full transform -skew-x-12"></div>
                                <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full transform -skew-x-12"></div>
                                <div className="w-3 h-12 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full transform -skew-x-12"></div>
                                <div className="w-4 h-16 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full transform -skew-x-12"></div>
                            </div>
                        </div>

                        {/* Heading */}
                        <h2 className="text-6xl font-bold text-white text-center mb-8">
                            Experience it yourself
                        </h2>

                        {/* CTA Button */}
                        <div className="flex justify-center">
                            <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                                Make Your First Video
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Translation Demo Section */}
            <TranslationDemoSection />

            {/* Four Steps Section */}
            <FourStepsSection />

            {/* Testimonials Carousel Section */}
            <TestimonialsCarouselSection />

            {/* Customer Stories Section */}
            <CustomerStoriesSection />

            {/* Features Section */}
            <FeaturesSection />

            {/* Polish Visuals Section */}
            <PolishVisualsSection />

            {/* Tweak the Documentation Section */}
            <TweakDocumentationSection />

            {/* Security Section */}
            <SecuritySection />

            {/* FAQ Section */}
            <FAQSection />

            {/* CTA Section */}
            <CTASection />

            {/* Footer Section */}
            <FooterSection />
        </div>
    );
}

function MenuListItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-5 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group/item">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover/item:bg-clueso-pink/10 group-hover/item:scale-110 transition-all text-clueso-pink">
                {icon}
            </div>
            <div className="pt-1">
                <h5 className="font-bold text-[15px] mb-1 group-hover/item:text-clueso-pink transition-colors">{title}</h5>
                <p className="text-gray-500 text-[13px] font-medium leading-tight">{desc}</p>
            </div>
        </div>
    );
}

// Icons for Menu
const VideoIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="2" y="4" width="20" height="16" rx="4" strokeWidth={2} />
        <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
        <path d="M3 6l2-2m14 0l2 2" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
);

const DocIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="3" strokeWidth={2} />
        <path d="M8 8h8M8 12h8M8 16h5" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
);

const TranslateIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M5 8h7m-3.5 0V5m1 10h4m-3.5-3.5a7 7 0 00-4 4" strokeWidth={2} strokeLinecap="round" />
        <text x="12" y="18" className="text-[10px] font-black" fill="currentColor">A</text>
    </svg>
);

const MicIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 4a3 3 0 00-3 3v5a3 3 0 006 0V7a3 3 0 00-3-3z" strokeWidth={2} />
        <path d="M19 10v1a7 7 0 01-14 0v-1m7 9v-3" strokeWidth={2} strokeLinecap="round" />
    </svg>
);

const SlidesIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="4" width="18" height="14" rx="3" strokeWidth={2} />
        <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
        <path d="M6 20h12" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
);

// Resources Dropdown Icons
const PenIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BookIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const VideoTextIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8h1" strokeWidth={3} strokeLinecap="round" />
        <path d="M12 11l2 2-2 2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChatIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function ComparisonSlider() {
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(pos);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (isDragging) handleMove(e.touches[0].clientX);
    };

    return (
        <div
            ref={containerRef}
            className="relative mx-auto rounded-[24px] shadow-[0_32px_120px_-15px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden cursor-col-resize select-none"
            style={{ width: '1176px', height: '661px', maxWidth: '100%' }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={onMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={onTouchMove}
        >
            {/* "Raw" Video (Left Side - Underneath) */}
            <div className="absolute inset-0 bg-white flex items-center justify-center">
                <div className="w-full h-full p-8 relative overflow-hidden bg-gray-50">
                    {/* Simulated Airbnb UI - Rough/Raw Version */}
                    <div className="bg-white w-full max-w-2xl mx-auto border border-gray-200 rounded-[20px] shadow-lg overflow-hidden opacity-60 grayscale">
                        <div className="h-10 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="w-40 h-6 bg-gray-200 rounded"></div>
                                    <div className="w-24 h-3 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2].map(i => <div key={i} className="aspect-video bg-gray-100 rounded-lg"></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* "Clueso" Video (Right Side - On Top with Clip Path) */}
            <div
                className="absolute inset-0 bg-white flex items-center justify-center overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <div className="w-full h-full p-8 relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                    {/* Simulated Airbnb UI - Polished Version */}
                    <div className="bg-white w-full max-w-2xl mx-auto border border-gray-100 rounded-[20px] shadow-2xl overflow-hidden">
                        <div className="h-10 border-b border-gray-50 flex items-center px-4 gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                            <div className="flex-1"></div>
                            <div className="w-24 h-3 bg-gray-100 rounded-full"></div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="w-40 h-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded"></div>
                                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-16 h-16 bg-gradient-to-br from-clueso-pink to-purple-500 rounded-full"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-gray-100 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-clueso-pink" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Floating Badge - "With Clueso" */}
                    <div className="absolute top-6 right-6">
                        <div className="bg-clueso-pink text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-xs font-black uppercase tracking-wide">With Clueso</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blue Draggable Divider Line */}
            <div
                className="absolute top-0 bottom-0 w-[2px] bg-blue-500 cursor-col-resize flex items-center justify-center z-10"
                style={{ left: `${sliderPos}%` }}
            >
                <div className="w-12 h-12 rounded-full bg-blue-500 shadow-[0_4px_20px_rgba(59,130,246,0.5)] flex items-center justify-center -translate-x-1/2">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-6 left-6 px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm rounded-lg text-white text-xs font-bold uppercase tracking-wider pointer-events-none">
                Rough Recording
            </div>
        </div>
    );
}

function MenuListItemSimple({ icon, title, desc, badge }: { icon: React.ReactNode, title: string, desc: string, badge?: string }) {
    return (
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50/80 transition-all cursor-pointer group/item">
            <div className="w-5 h-5 mt-0.5 text-clueso-pink transition-transform group-hover/item:scale-110">
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                    <h5 className="font-bold text-[14px] leading-none text-gray-900 group-hover/item:text-clueso-pink transition-colors">{title}</h5>
                    {badge && (
                        <span className="bg-clueso-pink text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter leading-none">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-gray-500 text-[12px] font-medium leading-tight">{desc}</p>
            </div>
        </div>
    );
}

function PriceCard({ name, price, features, cta, highlighted = false }: { name: string, price: string, features: string[], cta: string, highlighted?: boolean }) {
    return (
        <div className={`p-10 rounded-[32px] border transition-all duration-500 flex flex-col ${highlighted ? 'border-clueso-pink shadow-2xl shadow-clueso-pink/10 ring-1 ring-clueso-pink relative bg-white scale-105 z-10' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            {highlighted && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 py-2 px-6 bg-clueso-pink text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-clueso-pink/30">
                    Most Popular
                </span>
            )}
            <div className="mb-10">
                <p className={`text-[12px] font-black uppercase tracking-[0.2em] mb-4 ${highlighted ? 'text-clueso-pink' : 'text-gray-400'}`}>{name}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-[56px] font-black tracking-tight text-[#1a1a1a]">{typeof price === 'number' || !isNaN(Number(price)) ? `$${price}` : price}</span>
                    {price !== "Custom" && <span className="text-gray-400 text-[18px] font-bold">/mo</span>}
                </div>
            </div>
            <ul className="space-y-5 mb-12 flex-1">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-4 text-[15px] font-semibold text-gray-600">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${highlighted ? 'bg-clueso-pink/10 text-clueso-pink' : 'bg-emerald-50 text-emerald-500'}`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        {f}
                    </li>
                ))}
            </ul>
            <button className={`w-full py-4 rounded-2xl font-black text-[15px] uppercase tracking-widest transition-all ${highlighted ? 'bg-clueso-pink text-white shadow-xl shadow-clueso-pink/20 hover:scale-[1.03] active:scale-95' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}>
                {cta}
            </button>
        </div>
    );
}
