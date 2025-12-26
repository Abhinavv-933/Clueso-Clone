/**
 * Frontend environment configuration and validation
 */

export const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
    NODE_ENV: process.env.NODE_ENV || "development",
    IS_DEV: process.env.NODE_ENV === "development",
};

/**
 * Validates essential environment variables
 */
export const validateEnv = () => {
    // No-op or custom logic if needed, but removed hardcoded localhost warning
};

/**
 * Safe logging utility that only logs in development mode
 */
export const logger = {
    error: (...args: any[]) => {
        if (env.IS_DEV) {
            console.error("[ERROR]", ...args);
        }
    },
    warn: (...args: any[]) => {
        if (env.IS_DEV) {
            console.warn("[WARN]", ...args);
        }
    },
    info: (...args: any[]) => {
        if (env.IS_DEV) {
            console.info("[INFO]", ...args);
        }
    },
};
