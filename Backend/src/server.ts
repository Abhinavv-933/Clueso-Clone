import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { execSync } from "child_process";

const startServer = async () => {
    try {
        // Connect to Database
        await connectDB();

        // Verify Tools
        console.log("🔍 Verifying system tools...");
        try {
            const ffmpegVer = execSync("ffmpeg -version").toString().split("\n")[0];
            const ffprobeVer = execSync("ffprobe -version").toString().split("\n")[0];
            console.log(`✅ FFmpeg: ${ffmpegVer}`);
            console.log(`✅ FFprobe: ${ffprobeVer}`);
        } catch (toolError) {
            console.error("❌ Critical tools missing: Ensure ffmpeg and ffprobe are installed and in PATH.");
            if (env.NODE_ENV === "production") {
                throw new Error("Missing critical tools in production");
            }
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
