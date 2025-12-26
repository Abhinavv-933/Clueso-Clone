import { clerkMiddleware, requireAuth } from '@clerk/express';

// Exporting middleware to be used in routes
// Use requireAuth() for routes that need protection
export const clerkAuthMiddleware = clerkMiddleware();
export const requireAuthMiddleware = requireAuth();

