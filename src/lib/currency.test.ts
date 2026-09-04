import { describe, expect, it } from "vitest";
import {
  formatPkrGrouped,
  formatPkrFull,
  formatPriceShort,
  pricePerMarla,
} from "./currency";

describe("formatPkrGrouped", () => {
  it("groups using the Pakistani lakh/crore convention", () => {
    expect(formatPkrGrouped(12_500_000n)).toBe("1,25,00,000");
  });

  it("groups a sub-lakh amount normally", () => {
    expect(formatPkrGrouped(85_000n)).toBe("85,000");
  });
});

describe("formatPriceShort", () => {
  it("formats 95 Lac", () => {
    expect(formatPriceShort(9_500_000n)).toBe("95 Lac");
  });

  it("formats 1.25 Crore", () => {
    expect(formatPriceShort(12_500_000n)).toBe("1.25 Crore");
  });

  it("formats a whole crore without decimals", () => {
    expect(formatPriceShort(20_000_000n)).toBe("2 Crore");
  });

  it("formats a sub-lakh amount as grouped rupees", () => {
    expect(formatPriceShort(85_000n)).toBe("Rs 85,000");
  });

  it("returns Call for Price when priceOnRequest is set", () => {
    expect(formatPriceShort(0n, { priceOnRequest: true })).toBe("Call for Price");
  });

  it("returns Call for Price for a zero amount even without the flag", () => {
    expect(formatPriceShort(0n)).toBe("Call for Price");
  });
});

describe("formatPkrFull", () => {
  it("prefixes with Rs and groups digits", () => {
    expect(formatPkrFull(12_500_000n)).toBe("Rs 1,25,00,000");
  });
});

describe("pricePerMarla", () => {
  it("divides price by area in Marla", () => {
    // 5 Marla = 1125 sqft, price 5,000,000 -> 1,000,000 per Marla
    expect(pricePerMarla(5_000_000n, 1125)).toBe(1_000_000n);
  });

  it("returns 0 for a non-positive area", () => {
    expect(pricePerMarla(5_000_000n, 0)).toBe(0n);
  });
});
