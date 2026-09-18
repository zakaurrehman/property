import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import { MortgageCalculator } from "@/features/tools/mortgage-calculator";

export const metadata: Metadata = {
  alternates: localizedAlternates("/tools/mortgage-calculator"),
  title: "Mortgage Calculator",
  description:
    "Work out the monthly payment on a Pakistani home loan — price, down payment, KIBOR-based rate and tenure.",
};

export default function MortgageCalculatorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          Mortgage Calculator
        </h1>
        <p className="text-ink-600 mt-3 max-w-2xl">
          Estimate the monthly instalment on a home loan and see how much of it is
          interest. Adjust the sliders — everything updates as you go.
        </p>
      </div>
      <MortgageCalculator />
    </div>
  );
}
