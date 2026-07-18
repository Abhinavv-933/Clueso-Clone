import { clerkMiddleware } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';

// Reads session cookies/tokens and populates req.auth() for every request.
export const clerkAuthMiddleware = clerkMiddleware();

/**
 * Explicit auth guard for API routes.
 * Clerk's own `requireAuth()` redirects unauthenticated requests to a sign-in
 * URL, which breaks JSON API clients (they get an HTML redirect/404 instead
 * of a parseable error). This guard checks the auth state directly and
 * always responds with JSON.
 */
export const requireAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.auth();
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};
