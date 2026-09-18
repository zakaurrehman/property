import { z } from "zod";
import { omitEmptyValues } from "./env-normalize";

/**
 * Central env contract. Most integrations are wired up in later build
 * phases (DB in Phase 2, auth in Phase 6, email/uploads in Phase 5, etc.),
 * so those vars stay optional until the feature that needs them lands —
 * this keeps `pnpm build` green from commit one instead of failing on
 * secrets that don't exist yet.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Public site
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_NAME: z.string().default("Estate Bureau"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default("+923000000000"),
  NEXT_PUBLIC_CONTACT_PHONE: z.string().default("+924235000000"),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email().default("info@estatebureau.pk"),

  // Database
  DATABASE_URL: z.string({ error: "DATABASE_URL is required — see .env.example" }).min(1),

  // Auth.js (Phase 6). Required: without it Auth.js throws MissingSecret on
  // every /api/auth/* request in production, which surfaces as the generic
  // "There is a problem with the server configuration" page — far harder to
  // diagnose than a failed build naming the variable.
  AUTH_SECRET: z
    .string({ error: "AUTH_SECRET is required — generate one with `npx auth secret`" })
    .min(1),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Email (Phase 5)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  // Media uploads (Phase 6)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Rate limiting (Phase 5)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Bot protection (Phase 5)
  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Maps (Phase 4) — raster tile URL template ({z}/{x}/{y})
  NEXT_PUBLIC_MAP_TILES_URL: z
    .string()
    .default("https://tile.openstreetmap.org/{z}/{x}/{y}.png"),

  // FX (Phase 10 currency toggle) — admin-editable fallback rates
  FX_USD_PER_PKR: z.coerce.number().positive().optional(),
  FX_GBP_PER_PKR: z.coerce.number().positive().optional(),
  FX_AED_PER_PKR: z.coerce.number().positive().optional(),

  // Chat / LLM advisor (Phase 5)
  CHAT_LLM_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  // Blank values (Vercel placeholders, `KEY=` lines) count as unset — see env-normalize.ts.
  const parsed = envSchema.safeParse(omitEmptyValues(process.env));

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment variables. See .env.example for the full list.\n${issues}`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();

/** Throws with a clear message if a Phase-gated var is read before it's configured. */
export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const value = env[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(
      `Missing required environment variable "${key}". Set it in .env.local — see .env.example.`,
    );
  }
  return value as NonNullable<Env[K]>;
}
