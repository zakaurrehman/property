/**
 * Drops env entries whose value is empty/whitespace, so Zod's `.default()` and
 * `.optional()` treat them as unset.
 *
 * Hosts like Vercel let you save a variable with a blank value, and `KEY=` in
 * a .env file produces "" too. Without this, `z.string().url().default(...)`
 * sees "" (a present value), skips the default, and fails URL validation —
 * which is exactly how the first Vercel build after the admin work died:
 * seven optional integrations (Resend, Upstash, FX rates…) all "invalid"
 * because their placeholders were saved empty.
 *
 * Kept separate from env.ts so it can be unit-tested without triggering that
 * module's read of process.env at import time.
 */
export function omitEmptyValues(
  source: Record<string, string | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined && value.trim() !== "") out[key] = value;
  }
  return out;
}
