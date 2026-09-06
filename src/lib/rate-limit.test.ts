import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit (in-memory fallback — no Upstash env vars in test)", () => {
  it("allows requests up to the limit", async () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      const result = await rateLimit(key, { limit: 3, windowMs: 60_000 });
      expect(result.success).toBe(true);
    }
  });

  it("rejects requests once the limit is exceeded", async () => {
    const key = `test-${Math.random()}`;
    await rateLimit(key, { limit: 2, windowMs: 60_000 });
    await rateLimit(key, { limit: 2, windowMs: 60_000 });
    const third = await rateLimit(key, { limit: 2, windowMs: 60_000 });
    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets after the window expires", async () => {
    const key = `test-${Math.random()}`;
    await rateLimit(key, { limit: 1, windowMs: 10 });
    await new Promise((resolve) => setTimeout(resolve, 20));
    const afterWindow = await rateLimit(key, { limit: 1, windowMs: 10 });
    expect(afterWindow.success).toBe(true);
  });

  it("tracks separate keys independently", async () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    await rateLimit(keyA, { limit: 1, windowMs: 60_000 });
    const resultB = await rateLimit(keyB, { limit: 1, windowMs: 60_000 });
    expect(resultB.success).toBe(true);
  });
});
