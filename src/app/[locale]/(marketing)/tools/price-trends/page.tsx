import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import { getFileRateTrends } from "@/features/file-rate/server/queries";
import { PriceTrendsChart } from "@/features/tools/price-trends-chart";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  alternates: localizedAlternates("/tools/price-trends"),
  title: "Price Trends",
  description:
    "How DHA Lahore plot file demand rates have moved over time, phase by phase.",
};

export default async function PriceTrendsPage() {
  const phases = await getFileRateTrends("Lahore");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
            Price Trends
          </h1>
          <p className="text-ink-600 mt-3 max-w-2xl">
            Every file rate we publish is tracked over time. Pick a phase to see how
            demand prices have moved — the same history behind the trend arrows on the
            file rates page.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/file-rates">Current file rates</Link>
        </Button>
      </div>
      <PriceTrendsChart phases={phases} />
    </div>
  );
}
