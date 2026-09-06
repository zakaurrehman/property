import type { Metadata } from "next";
import { ClipboardCheck, TrendingUp, Users } from "lucide-react";
import { ValuationForm } from "@/features/lead/components/valuation-form";

export const metadata: Metadata = {
  title: "Free Property Valuation",
  description:
    "Get a free, no-obligation valuation of your DHA Lahore property — grounded in real file rates and recent transactions.",
};

const points = [
  {
    icon: TrendingUp,
    title: "Backed by real file rates",
    body: "Our estimate is cross-checked against current DHA file rates and recent nearby transactions, not guesswork.",
  },
  {
    icon: Users,
    title: "A real agent follows up",
    body: "No automated report — one of our specialists reviews your property and calls or WhatsApps you directly.",
  },
  {
    icon: ClipboardCheck,
    title: "No obligation",
    body: "Useful whether you're selling next month or just curious what your property is worth today.",
  },
];

export default function ValuationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          What&apos;s Your Property Worth?
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Get a free valuation from a DHA Lahore specialist — usually within one business
          day.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-5">
          {points.map((point) => (
            <div key={point.title} className="flex items-start gap-3">
              <span className="bg-brand-900 text-accent-400 flex size-10 shrink-0 items-center justify-center rounded-full">
                <point.icon className="size-5" />
              </span>
              <div>
                <p className="text-ink-900 font-medium">{point.title}</p>
                <p className="text-ink-600 text-sm">{point.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-line bg-surface rounded-2xl border p-6 shadow-sm sm:p-8">
          <ValuationForm />
        </div>
      </div>
    </div>
  );
}
