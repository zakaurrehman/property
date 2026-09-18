import { describe, expect, it } from "vitest";
import { z } from "zod";
import { omitEmptyValues } from "./env-normalize";

// Re-declare the shape under test rather than importing lib/env.ts directly:
// that module reads process.env at import time, which we don't want to
// mutate globally from a test.
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().optional(),
  FX_USD_PER_PKR: z.coerce.number().positive().optional(),
});

const required = { AUTH_SECRET: "test-secret" };

describe("env schema", () => {
  it("defaults NEXT_PUBLIC_SITE_URL when unset", () => {
    const parsed = envSchema.parse(required);
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  it("leaves phase-gated secrets optional", () => {
    const parsed = envSchema.parse(required);
    expect(parsed.DATABASE_URL).toBeUndefined();
    expect(parsed.AUTH_GOOGLE_ID).toBeUndefined();
  });

  // A blank AUTH_SECRET on the host used to pass validation and then take
  // down every /api/auth/* route at runtime with Auth.js's MissingSecret.
  it("requires AUTH_SECRET, including when it is saved blank", () => {
    expect(() => envSchema.parse({})).toThrow(/AUTH_SECRET/);
    expect(() => envSchema.parse(omitEmptyValues({ AUTH_SECRET: "" }))).toThrow(
      /AUTH_SECRET/,
    );
  });

  it("rejects a malformed site URL", () => {
    expect(() =>
      envSchema.parse({ ...required, NEXT_PUBLIC_SITE_URL: "not-a-url" }),
    ).toThrow();
  });

  it("coerces numeric FX rate strings", () => {
    const parsed = envSchema.parse({ ...required, FX_USD_PER_PKR: "0.0036" });
    expect(parsed.FX_USD_PER_PKR).toBeCloseTo(0.0036);
  });

  // The Vercel failure mode: placeholders saved with blank values. Without
  // normalisation "" is a present value, so defaults don't apply and
  // .url()/.positive() reject it.
  it("rejects blank values when passed through raw", () => {
    expect(() =>
      envSchema.parse({ ...required, NEXT_PUBLIC_SITE_URL: "", FX_USD_PER_PKR: "" }),
    ).toThrow();
  });

  it("treats blank values as unset once normalised", () => {
    const parsed = envSchema.parse(
      omitEmptyValues({
        NEXT_PUBLIC_SITE_URL: "",
        FX_USD_PER_PKR: "   ",
        AUTH_SECRET: "real-secret",
        DATABASE_URL: "postgres://real",
      }),
    );
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(parsed.FX_USD_PER_PKR).toBeUndefined();
    expect(parsed.AUTH_SECRET).toBe("real-secret");
    expect(parsed.DATABASE_URL).toBe("postgres://real");
  });
});

describe("omitEmptyValues", () => {
  it("drops empty, whitespace and undefined entries and keeps the rest", () => {
    expect(omitEmptyValues({ A: "", B: "  ", C: undefined, D: "x", E: " y " })).toEqual({
      D: "x",
      E: " y ",
    });
  });
});
