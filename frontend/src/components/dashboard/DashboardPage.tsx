"use client";

import { useState } from "react";
import UploadContainer from "@/components/UploadContainer";
import UploadedMediaList from "@/components/UploadedMediaList";

export default function DashboardPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="flex flex-col items-center gap-12 pt-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your Workspace</h1>
                <p className="text-gray-500 font-medium">Manage and polish your recordings with AI</p>
            </div>

            <div className="w-full max-w-4xl space-y-12">
                <UploadContainer onUploadSuccess={handleUploadSuccess} />
                <UploadedMediaList refreshKey={refreshKey} />
            </div>
        </div>
    );
}
