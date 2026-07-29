import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  FIREBASE_PROJECT_ID: z.string({ required_error: "FIREBASE_PROJECT_ID is required" }),
  FIREBASE_PRIVATE_KEY_ID: z.string({ required_error: "FIREBASE_PRIVATE_KEY_ID is required" }),
  FIREBASE_PRIVATE_KEY: z.string({ required_error: "FIREBASE_PRIVATE_KEY is required" }),
  FIREBASE_CLIENT_EMAIL: z.string().email({ message: "FIREBASE_CLIENT_EMAIL must be a valid email" }),
  FIREBASE_CLIENT_ID: z.string({ required_error: "FIREBASE_CLIENT_ID is required" }),
  FIREBASE_STORAGE_BUCKET: z.string({ required_error: "FIREBASE_STORAGE_BUCKET is required" }),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
export default env;
