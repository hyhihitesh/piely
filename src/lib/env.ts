import { z } from "zod";

const envSchema = z.object({
    // Public - Client Side
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

    // Private - Server Side
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(), // Optional for now as only some actions use it
    OPENAI_API_KEY: z.string().min(1).optional(),
    EXA_API_KEY: z.string().optional(),
    VERCEL_TOKEN: z.string().optional(),

    // Node Environment
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Validate process.env
const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    EXA_API_KEY: process.env.EXA_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
}

export const env = parsed.data;
