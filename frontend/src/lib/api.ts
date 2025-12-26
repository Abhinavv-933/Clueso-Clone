/**
 * Centralized API configuration for the frontend.
 * 
 * Provides the base URL for the backend services, correctly handling
 * development vs production environments.
 */

const getApiBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const isProd = process.env.NODE_ENV === "production";

    if (!envUrl) {
        if (isProd) {
            console.error(
                "❌ CRITICAL ERROR: NEXT_PUBLIC_API_URL is missing in the production environment! " +
                "The frontend will not be able to connect to the backend."
            );
            // In production, we should NOT fallback to localhost to avoid net::ERR_BLOCKED_BY_CLIENT
            // returning empty string or a specific error indicator might be safer, 
            // but for now we follow the instruction "Never fallback to localhost in production"
            return "";
        } else {
            console.warn(
                "⚠️ NEXT_PUBLIC_API_URL is not defined. Falling back to http://localhost:8000 for local development."
            );
            return "http://localhost:8000";
        }
    }

    return envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
