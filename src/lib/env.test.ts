import { describe, expect, it } from "vitest";
import { z } from "zod";

// Re-declare the shape under test rather than importing lib/env.ts directly:
// that module reads process.env at import time, which we don't want to
// mutate globally from a test.
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  FX_USD_PER_PKR: z.coerce.number().positive().optional(),
});

describe("env schema", () => {
  it("defaults NEXT_PUBLIC_SITE_URL when unset", () => {
    const parsed = envSchema.parse({});
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  it("leaves phase-gated secrets optional", () => {
    const parsed = envSchema.parse({});
    expect(parsed.DATABASE_URL).toBeUndefined();
    expect(parsed.AUTH_SECRET).toBeUndefined();
  });

  it("rejects a malformed site URL", () => {
    expect(() => envSchema.parse({ NEXT_PUBLIC_SITE_URL: "not-a-url" })).toThrow();
  });

  it("coerces numeric FX rate strings", () => {
    const parsed = envSchema.parse({ FX_USD_PER_PKR: "0.0036" });
    expect(parsed.FX_USD_PER_PKR).toBeCloseTo(0.0036);
  });
});
