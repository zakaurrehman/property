import { describe, expect, it } from "vitest";
import {
  formatAreaLabel,
  fromSqft,
  SQFT_PER_KANAL,
  SQFT_PER_MARLA,
  toSqft,
} from "./units";

describe("toSqft", () => {
  it("converts Marla to sqft", () => {
    expect(toSqft(5, "MARLA")).toBe(1125);
  });

  it("converts Kanal to sqft", () => {
    expect(toSqft(1, "KANAL")).toBe(4500);
  });

  it("converts Sq Yd to sqft", () => {
    expect(toSqft(100, "SQYD")).toBe(900);
  });

  it("passes sqft through unchanged", () => {
    expect(toSqft(2500, "SQFT")).toBe(2500);
  });
});

describe("fromSqft", () => {
  it("converts sqft back to Marla", () => {
    expect(fromSqft(1125, "MARLA")).toBe(5);
  });

  it("converts sqft back to Kanal", () => {
    expect(fromSqft(SQFT_PER_KANAL, "KANAL")).toBe(1);
  });
});

describe("formatAreaLabel", () => {
  it("formats a plain Marla size", () => {
    expect(formatAreaLabel(5 * SQFT_PER_MARLA)).toBe("5 Marla");
  });

  it("formats an exact Kanal size", () => {
    expect(formatAreaLabel(SQFT_PER_KANAL)).toBe("1 Kanal");
  });

  it("formats a mixed Kanal + Marla size", () => {
    expect(formatAreaLabel(SQFT_PER_KANAL + 10 * SQFT_PER_MARLA)).toBe(
      "1 Kanal 10 Marla",
    );
  });

  it("formats sqft when explicitly requested", () => {
    expect(formatAreaLabel(2500, "SQFT")).toBe("2,500 Sq Ft");
  });

  it("formats sq yd when explicitly requested", () => {
    expect(formatAreaLabel(900, "SQYD")).toBe("100 Sq Yd");
  });
});
