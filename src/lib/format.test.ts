import { describe, expect, it } from "vitest";
import { formatRelativeDate } from "./format";

const NOW = new Date(2026, 8, 4); // 2026-09-04, matches month indices (Sep = 8)

describe("formatRelativeDate", () => {
  it("returns Today for the current date", () => {
    expect(formatRelativeDate(NOW, NOW)).toBe("Today");
  });

  it("returns Yesterday for one day back", () => {
    expect(formatRelativeDate(new Date(2026, 8, 3), NOW)).toBe("Yesterday");
  });

  it("returns a day count under a week", () => {
    expect(formatRelativeDate(new Date(2026, 7, 29), NOW)).toBe("6 days ago");
  });

  it("returns a week count under a month", () => {
    expect(formatRelativeDate(new Date(2026, 7, 21), NOW)).toBe("2 weeks ago");
  });

  it("falls back to a plain date for older entries", () => {
    expect(formatRelativeDate(new Date(2026, 5, 1), NOW)).toBe("1 Jun 2026");
  });
});
