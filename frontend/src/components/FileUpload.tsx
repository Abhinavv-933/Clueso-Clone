"use client";

import React, { useRef, useState, useCallback } from "react";

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    disabled?: boolean;
}

const CONFIG = {
    IMAGE: {
        maxSize: 10 * 1024 * 1024,
        types: ["image/jpeg", "image/png", "image/webp"],
        label: "Image",
    },
    VIDEO: {
        maxSize: 500 * 1024 * 1024,
        types: ["video/mp4", "video/webm", "video/quicktime"],
        label: "Video",
    },
    PDF: {
        maxSize: 20 * 1024 * 1024,
        types: ["application/pdf"],
        label: "PDF",
    },
};

/**
 * FileUpload Component
 * 
 * A reusable file selection component with support for:
 * - Drag and Drop
 * - Accessibility (ARIA labels & keyboard support)
 * - Category-based validation (Image, Video, PDF)
 * - Size limit enforcement
 */
export default function FileUpload({
    onFileSelect,
    accept,
    disabled = false,
}: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Identifies the file category and returns its specific configuration (limits, types)
     */
    const getFileCategory = (mimeType: string) => {
        if (CONFIG.IMAGE.types.includes(mimeType)) return CONFIG.IMAGE;
        if (CONFIG.VIDEO.types.includes(mimeType)) return CONFIG.VIDEO;
        if (CONFIG.PDF.types.includes(mimeType)) return CONFIG.PDF;
        return null;
    };

    /**
     * Main validation logic for file type and size
     */
    const validateAndSelect = useCallback((selectedFile: File) => {
        setError(null);
        const category = getFileCategory(selectedFile.type);

        if (!category) {
            setError("Unsupported file type. Use Image, Video, or PDF.");
            setFile(null);
            return false;
        }

        if (selectedFile.size > category.maxSize) {
            const sizeMB = category.maxSize / (1024 * 1024);
            setError(`${category.label} exceeds the ${sizeMB}MB limit.`);
            setFile(null);
            return false;
        }

        setFile(selectedFile);
        onFileSelect(selectedFile);
        return true;
    }, [onFileSelect]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const success = validateAndSelect(e.target.files[0]);
            if (!success && fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSelect(e.dataTransfer.files[0]);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center gap-6 p-10 border-2 border-dashed rounded-[32px] transition-all duration-500 ease-out shadow-sm/30 ${isDragging
                ? "border-slate-400 bg-slate-50/50 scale-[1.01] shadow-xl shadow-slate-200/50"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-100"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            aria-label="File upload area"
            role="region"
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                disabled={disabled}
                className="sr-only"
                id="file-upload-input"
                aria-describedby="file-upload-error"
            />

            {/* Icon/Decoration */}
            <div className={`p-5 rounded-2xl ${isDragging ? "bg-slate-900 text-white scale-110" : "bg-slate-50 text-slate-400"} shadow-sm transition-all duration-500`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>

            <div className="text-center space-y-1">
                {!file ? (
                    <>
                        <p className="text-gray-700 font-medium">
                            {isDragging ? "Drop it here!" : "Drag type or click to browse"}
                        </p>
                        <p className="text-sm text-gray-400">
                            Supports Images, Videos and PDFs
                        </p>
                    </>
                ) : (
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <p className="font-semibold text-gray-800 truncate max-w-[240px]">{file.name}</p>
                        <div className="flex items-center justify-center gap-2 mt-1 text-xs text-indigo-500 font-medium uppercase tracking-tighter">
                            <span>{formatFileSize(file.size)}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{getFileCategory(file.type)?.label}</span>
                        </div>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={handleButtonClick}
                disabled={disabled}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${disabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-95"
                    }`}
                aria-controls="file-upload-input"
            >
                {file ? "Change Selection" : "Browse Files"}
            </button>

            {error && (
                <p
                    id="file-upload-error"
                    className="text-sm text-red-500 mt-2 font-medium animate-in zoom-in-95"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
