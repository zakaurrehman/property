import { describe, expect, it } from "vitest";
import { calculateMortgage, projectInvestment } from "./finance";

describe("calculateMortgage", () => {
  it("matches the standard amortisation formula", () => {
    // 1 Crore price, 20% down → 80 Lac over 20 years at 12%.
    const r = calculateMortgage({
      price: 10_000_000,
      downPaymentPct: 20,
      annualRatePct: 12,
      years: 20,
    });
    expect(r.downPayment).toBe(2_000_000);
    expect(r.principal).toBe(8_000_000);
    // Known value: 8,000,000 * 0.01 / (1 - 1.01^-240) ≈ 88,087
    expect(r.monthlyPayment).toBe(88_087);
    expect(r.totalInterest).toBe(r.totalPaid - r.principal);
    expect(r.schedule).toHaveLength(20);
    expect(r.schedule.at(-1)?.balance).toBe(0);
  });

  it("divides evenly at 0% and pays no interest", () => {
    const r = calculateMortgage({
      price: 1_200_000,
      downPaymentPct: 0,
      annualRatePct: 0,
      years: 1,
    });
    expect(r.monthlyPayment).toBe(100_000);
    expect(r.totalInterest).toBe(0);
  });

  it("schedule interest sums to total interest", () => {
    const r = calculateMortgage({
      price: 5_000_000,
      downPaymentPct: 10,
      annualRatePct: 15,
      years: 7,
    });
    const scheduled = r.schedule.reduce((n, y) => n + y.interestPaid, 0);
    expect(Math.abs(scheduled - r.totalInterest)).toBeLessThan(r.schedule.length + 1); // rounding per year
  });
});

describe("projectInvestment", () => {
  it("compounds appreciation and adds flat rent", () => {
    const r = projectInvestment({
      price: 10_000_000,
      appreciationPct: 10,
      rentalYieldPct: 5,
      years: 2,
      transactionCostsPct: 0,
    });
    expect(r.finalValue).toBe(12_100_000);
    expect(r.capitalGain).toBe(2_100_000);
    expect(r.totalRent).toBe(1_000_000);
    expect(r.netProfit).toBe(3_100_000);
    expect(r.roiPct).toBe(31);
    expect(r.timeline).toHaveLength(2);
  });

  it("subtracts transaction costs from profit", () => {
    const r = projectInvestment({
      price: 10_000_000,
      appreciationPct: 0,
      rentalYieldPct: 0,
      years: 3,
      transactionCostsPct: 3,
    });
    expect(r.transactionCosts).toBe(300_000);
    expect(r.netProfit).toBe(-300_000);
    expect(r.roiPct).toBe(-3);
  });

  it("annualised return equals the appreciation rate when there's no rent or costs", () => {
    const r = projectInvestment({
      price: 5_000_000,
      appreciationPct: 8,
      rentalYieldPct: 0,
      years: 5,
      transactionCostsPct: 0,
    });
    expect(r.annualisedPct).toBe(8);
  });
});
