import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { getAreaIndex } from "@/features/location/server/queries";
import { formatPkrFull } from "@/lib/currency";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  alternates: localizedAlternates("/areas"),
  title: "Area Guides",
  description:
    "Explore DHA Lahore and the city's top societies — prices, phases and listings.",
};

export default async function AreasPage() {
  const areas = await getAreaIndex();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          Area Guides
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Explore Lahore&apos;s top societies — average prices, phases, and live listings.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <Link
            key={area.id}
            href={`/areas/lahore/${area.slug}`}
            className="border-line bg-surface group overflow-hidden rounded-2xl border transition-shadow hover:shadow-sm"
          >
            <div className="bg-surface-2 relative aspect-video overflow-hidden">
              {area.heroImage && (
                <Image
                  src={area.heroImage}
                  alt={area.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
              )}
            </div>
            <div className="p-4">
              <div className="mb-1 flex items-center gap-1.5">
                <MapPin className="text-accent-600 size-4" />
                <p className="text-ink-900 font-heading font-semibold">{area.name}</p>
              </div>
              <p className="text-ink-500 text-sm">
                {area.phaseCount > 0 ? `${area.phaseCount} phases · ` : ""}
                {area.propertyCount} listing{area.propertyCount === 1 ? "" : "s"}
              </p>
              {area.avgPricePerMarla !== null && (
                <p className="text-ink-700 mt-1 text-sm font-medium">
                  ~{formatPkrFull(area.avgPricePerMarla)} / Marla
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
