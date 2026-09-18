import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import { InvestmentCalculator } from "@/features/tools/investment-calculator";

export const metadata: Metadata = {
  alternates: localizedAlternates("/tools/investment-calculator"),
  title: "Investment Calculator",
  description:
    "Project the return on a DHA Lahore plot, file or house — appreciation, rental yield, holding period and transaction costs.",
};

export default function InvestmentCalculatorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          Investment Calculator
        </h1>
        <p className="text-ink-600 mt-3 max-w-2xl">
          What could a plot, file or rental property be worth in five years? Set your own
          assumptions and see the net return after buying and selling costs.
        </p>
      </div>
      <InvestmentCalculator />
    </div>
  );
}
