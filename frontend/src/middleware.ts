import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define strict protected routes
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/projects(.*)',
    '/editor(.*)',
]);

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    // 1. If user tries to access a protected route and is not logged in, enforce login
    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
