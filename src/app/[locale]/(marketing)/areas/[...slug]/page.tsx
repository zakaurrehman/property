import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import {
  getLocationGuide,
  getPropertiesForLocationIds,
} from "@/features/location/server/queries";
import { PropertyGrid } from "@/features/property/components/property-grid";
import { formatPkrFull } from "@/lib/currency";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getLocationGuide(slug[slug.length - 1]);
  if (!guide) return {};
  return {
    title: `${guide.name} — Area Guide`,
    description:
      guide.description ?? `Properties, price trends and phases in ${guide.name}.`,
  };
}

export default async function AreaGuidePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const locationSlug = slug[slug.length - 1];
  const guide = await getLocationGuide(locationSlug);
  if (!guide) notFound();

  const results = await getPropertiesForLocationIds(guide.descendantLocationIds);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="text-ink-500 mb-4 flex flex-wrap items-center gap-1 text-sm">
        <Link href="/areas" className="hover:text-ink-900">
          Areas
        </Link>
        {guide.breadcrumbs.map((crumb) => (
          <span key={crumb.slug} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" />
            <Link href={`/areas/lahore/${crumb.slug}`} className="hover:text-ink-900">
              {crumb.name}
            </Link>
          </span>
        ))}
        <span className="flex items-center gap-1">
          <ChevronRight className="size-3.5" />
          <span className="text-ink-900">{guide.name}</span>
        </span>
      </nav>

      {guide.heroImage && (
        <div className="bg-surface-2 relative mb-6 aspect-21/9 overflow-hidden rounded-2xl">
          <Image
            src={guide.heroImage}
            alt={guide.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <MapPin className="text-accent-600 size-5" />
        <h1 className="font-heading text-ink-900 text-3xl font-bold">{guide.name}</h1>
      </div>
      {guide.avgPricePerMarla !== null && (
        <p className="text-ink-700 mb-3 font-medium">
          Average price: ~{formatPkrFull(guide.avgPricePerMarla)} / Marla
        </p>
      )}
      {guide.description && (
        <p className="text-ink-600 max-w-3xl leading-relaxed">{guide.description}</p>
      )}

      {guide.children.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-ink-900 mb-4 text-lg font-bold">Phases</h2>
          <div className="flex flex-wrap gap-2">
            {guide.children.map((child) => (
              <Link
                key={child.slug}
                href={`/areas/lahore/${guide.slug}/${child.slug}`}
                className="border-line bg-surface hover:bg-surface-2 rounded-full border px-4 py-2 text-sm font-medium"
              >
                {child.name} <span className="text-ink-500">({child.propertyCount})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-heading text-ink-900 mb-4 text-xl font-bold">
          Listings in {guide.name} ({results.totalCount})
        </h2>
        <PropertyGrid items={results.items} />
      </div>
    </div>
  );
}
