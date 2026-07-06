import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('8000').transform((val) => parseInt(val, 10)),
    MONGO_URI: z.string().url(),
    CLERK_PUBLISHABLE_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLOUDINARY_URL: z.string().min(1),
    GROQ_API_KEY: z.string().min(1),  // ← add this
    ENABLE_SCRIPT_IMPROVEMENT: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsedEnv.error.format(), null, 2));
    process.exit(1);
}

export const env = parsedEnv.data;

console.log(
    `[env] GROQ_API_KEY loaded: ${env.GROQ_API_KEY ? `yes (${env.GROQ_API_KEY.slice(0, 4)}...${env.GROQ_API_KEY.slice(-4)}, len=${env.GROQ_API_KEY.length})` : 'NO'}`
);
console.log(`[env] CLOUDINARY_URL loaded: ${env.CLOUDINARY_URL ? 'yes' : 'NO'}`);