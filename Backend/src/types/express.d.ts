import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId?: string;
            };
        }
    }
}

export { };
