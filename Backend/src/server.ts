import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { execSync } from "child_process";

const startServer = async () => {
    try {
        // Connect to Database
        await connectDB();

        // Verify Tools
        // FFmpeg is now only a fallback path for transcription (transcribeVideo.worker
        // sends most files straight to Groq, and falls back to ffmpeg-static when it
        // needs to extract audio), so a missing system ffmpeg is a warning, not fatal.
        console.log("🔍 Verifying system tools...");
        try {
            const ffmpegVer = execSync("ffmpeg -version").toString().split("\n")[0];
            const ffprobeVer = execSync("ffprobe -version").toString().split("\n")[0];
            console.log(`✅ FFmpeg: ${ffmpegVer}`);
            console.log(`✅ FFprobe: ${ffprobeVer}`);
        } catch (toolError) {
            console.warn("⚠️ System ffmpeg/ffprobe not found on PATH; falling back to ffmpeg-static where needed.");
        }

        const PORT = env.PORT || 8000;

        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
