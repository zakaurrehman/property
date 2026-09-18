import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, Users2, MessagesSquare, TrendingUp } from "lucide-react";
import { HeroSearch } from "@/features/search/components/hero-search";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    title: t("heroTitle"),
    description: t("heroSubtitle"),
    alternates: localizedAlternates("/"),
  };
}

const trustPoints = [
  { icon: ShieldCheck, labelKey: "verified", label: "Verified listings, every time" },
  { icon: Users2, labelKey: "agents", label: "8+ agents who actually answer" },
  {
    icon: MessagesSquare,
    labelKey: "whatsapp",
    label: "WhatsApp-first, no chasing calls",
  },
  { icon: TrendingUp, labelKey: "rates", label: "Live DHA file rates, not guesswork" },
];

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div>
      <section className="bg-brand-900 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,162,39,0.25),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(40,96,168,0.35),transparent_40%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <p className="border-accent-500/40 bg-accent-500/10 text-accent-400 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide uppercase">
            {t("heroEyebrow")}
          </p>
          <h1 className="font-heading max-w-3xl text-4xl font-bold text-balance text-white sm:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-2xl text-lg text-balance text-white/70">
            {t("heroSubtitle")}
          </p>

          <HeroSearch />
        </div>
      </section>

      <section className="border-line bg-surface-2 border-b">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustPoints.map((point) => (
            <div key={point.label} className="flex items-start gap-3">
              <span className="bg-brand-900 text-accent-400 flex size-10 shrink-0 items-center justify-center rounded-full">
                <point.icon className="size-5" />
              </span>
              <p className="text-ink-900 text-sm font-medium">{point.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
