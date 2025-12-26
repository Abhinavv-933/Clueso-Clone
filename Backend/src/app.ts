import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";
import rateLimit from "express-rate-limit";

import { errorHandler } from "./middleware/error";
import { healthRoutes as appHealthRoutes } from "./routes/health";
import projectRoutes from "./routes/project.routes";
import uploadRoutes from "./routes/upload.routes";
import cluesoHealthRoutes from './clueso/routes/health.route';
import cluesoJobRoutes from './clueso/routes/job.route';
import audioExtractionRoutes from './clueso/routes/audioExtraction.route';
import transcriptionRoutes from './clueso/routes/transcription.route';
import scriptImprovementRoutes from './clueso/routes/scriptImprovement.route';
import voiceoverRoutes from './clueso/routes/voiceover.route';
import videoRenderRoutes from './clueso/routes/videoRender.route';
import transcriptRoutes from './clueso/routes/transcript.route';
import rewriteRoutes from './clueso/routes/rewrite.route';

const app = express();

/**
 * ✅ CORS — MUST BE FIRST
 * - Exact frontend origin
 * - credentials: true (for Clerk cookies)
 */
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

/**
 * Security & logging
 */
app.use(helmet());
app.use(morgan("dev"));

/**
 * Body parser
 */
app.use(express.json());

/**
 * Clerk Auth Middleware
 * Reads session cookies and populates req.auth
 */
app.use(clerkMiddleware());

/**
 * Rate Limiting — Basic protection for public sharing
 */
const shareLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Too many requests, please try again later." }
});

/**
 * Routes
 */
app.use("/api/projects", projectRoutes);
app.use("/api/uploads", shareLimiter, uploadRoutes);
app.use("/api/clueso", cluesoHealthRoutes);
app.use("/api/clueso/jobs", cluesoJobRoutes);
app.use("/api/clueso", audioExtractionRoutes);
app.use("/api/clueso", transcriptionRoutes);
app.use("/api/clueso", scriptImprovementRoutes);
app.use("/api/clueso", voiceoverRoutes);
app.use("/api/clueso", videoRenderRoutes);
app.use("/api/clueso", transcriptRoutes);
app.use("/api/clueso", rewriteRoutes);
app.use("/health", appHealthRoutes);

// Error handling middleware
/**
 * Global error handler (last)
 */
app.use(errorHandler);

export default app;
