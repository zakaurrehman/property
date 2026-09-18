import type { Metadata } from "next";
import { absoluteUrl, localizedAlternates, socialImage } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { after } from "next/server";
import {
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Car,
  Compass,
  Eye,
  Layers,
  Maximize,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/shared/price-tag";
import { AreaBadge } from "@/components/shared/area-badge";
import { getAmenityIcon } from "@/lib/amenity-icons";
import { getAmenityDisplay } from "@/lib/amenity-catalog";
import { formatRelativeDate } from "@/lib/format";
import {
  getPropertyBySlug,
  getSimilarProperties,
  incrementPropertyViewCount,
} from "@/features/property/server/queries";
import { PropertyGallery } from "@/features/property/components/property-gallery";
import { AgentContactCard } from "@/features/property/components/agent-contact-card";
import { PropertyGrid } from "@/features/property/components/property-grid";
import { CopyRefButton } from "@/features/property/components/copy-ref-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  return {
    title: property.seoTitle ?? property.title,
    description: property.seoDescription ?? property.description.slice(0, 160),
    alternates: localizedAlternates(`/properties/${slug}`),
    ...socialImage(property.media[0]?.url, property.title),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: property.media[0]
        ? [{ url: property.media[0].url, alt: property.title }]
        : undefined,
    },
  };
}

const specRows = (property: NonNullable<Awaited<ReturnType<typeof getPropertyBySlug>>>) =>
  [
    property.bedrooms != null && {
      icon: BedDouble,
      label: "Bedrooms",
      value: property.bedrooms,
    },
    property.bathrooms != null && {
      icon: Bath,
      label: "Bathrooms",
      value: property.bathrooms,
    },
    { icon: Maximize, label: "Area", value: <AreaBadge areaSqft={property.areaSqft} /> },
    property.floors != null && { icon: Layers, label: "Floors", value: property.floors },
    property.parking != null && { icon: Car, label: "Parking", value: property.parking },
    property.kitchens != null && {
      icon: Utensils,
      label: "Kitchens",
      value: property.kitchens,
    },
    property.yearBuilt != null && {
      icon: Calendar,
      label: "Year Built",
      value: property.yearBuilt,
    },
    property.facing != null && {
      icon: Compass,
      label: "Facing",
      value: property.facing.replace(/_/g, " "),
    },
    {
      icon: Building2,
      label: "Possession",
      value: property.possession.replace(/_/g, " "),
    },
  ].filter(Boolean) as {
    icon: typeof BedDouble;
    label: string;
    value: React.ReactNode;
  }[];

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  after(() => incrementPropertyViewCount(property.id));

  const similar = await getSimilarProperties(property);
  const society = property.location.parent?.parent ?? property.location.parent;
  const city = property.location.parent?.parent
    ? property.location.parent.parent
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: absoluteUrl(`/properties/${property.slug}`),
    datePosted: property.publishedAt?.toISOString(),
    image: property.media.map((m) => m.url),
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: city?.name ?? "Lahore",
      addressCountry: "PK",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.areaSqft,
      unitCode: "FTK",
    },
    ...(property.bedrooms != null ? { numberOfRooms: property.bedrooms } : {}),
    offers: {
      "@type": "Offer",
      price: property.priceOnRequest ? undefined : property.price.toString(),
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />

      <nav
        aria-label="Breadcrumb"
        className="text-ink-400 mb-4 flex flex-wrap items-center gap-1 text-xs"
      >
        <Link href="/" className="hover:text-accent-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/properties" className="hover:text-accent-600">
          Properties
        </Link>
        {city && (
          <>
            <span>/</span>
            <span>{city.name}</span>
          </>
        )}
        {society && (
          <>
            <span>/</span>
            <span>{society.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-ink-600">{property.location.name}</span>
      </nav>

      <PropertyGallery media={property.media} title={property.title} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-brand-900 hover:bg-brand-900 text-white">
                For {property.purpose === "SALE" ? "Sale" : "Rent"}
              </Badge>
              {property.isVerified && (
                <Badge className="gap-1 bg-emerald-500 text-white hover:bg-emerald-500">
                  <ShieldCheck className="size-3" /> Verified
                </Badge>
              )}
              <CopyRefButton refCode={property.refCode} />
              <span className="text-ink-400 ml-auto flex items-center gap-1 text-xs">
                <Eye className="size-3.5" /> {property.viewCount.toLocaleString()} views
              </span>
            </div>

            <h1 className="font-heading text-ink-900 mt-3 text-2xl font-bold sm:text-3xl">
              {property.title}
            </h1>
            <p className="text-ink-600 mt-1 text-sm">{property.address}</p>
            <p className="text-ink-400 mt-1 text-xs">
              Posted {formatRelativeDate(property.publishedAt ?? property.createdAt)} ·
              Updated {formatRelativeDate(property.updatedAt)}
            </p>

            <div className="mt-4">
              <PriceTag
                price={property.price}
                priceOnRequest={property.priceOnRequest}
                areaSqft={property.areaSqft}
                rentPeriod={property.rentPeriod}
                className="text-2xl"
              />
            </div>
          </div>

          <div className="border-line bg-surface-2 grid grid-cols-2 gap-4 rounded-2xl border p-5 sm:grid-cols-3">
            {specRows(property).map((row) => (
              <div key={row.label} className="flex items-center gap-2.5">
                <row.icon className="text-ink-400 size-4 shrink-0" />
                <div>
                  <p className="text-ink-400 text-[11px]">{row.label}</p>
                  <p className="text-ink-900 text-sm font-medium capitalize">
                    {row.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-heading text-ink-900 mb-2 text-lg font-semibold">
              Description
            </h2>
            <p className="text-ink-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {property.amenities.length > 0 && (
            <div>
              <h2 className="font-heading text-ink-900 mb-3 text-lg font-semibold">
                Amenities
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.amenities.map((slug) => {
                  const display = getAmenityDisplay(slug);
                  const Icon = getAmenityIcon(display.icon);
                  return (
                    <div
                      key={slug}
                      className="text-ink-600 flex items-center gap-2 text-sm"
                    >
                      <Icon className="text-accent-600 size-4" />
                      <span>{display.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {similar.length > 0 && (
            <div>
              <h2 className="font-heading text-ink-900 mb-3 text-lg font-semibold">
                Similar Properties
              </h2>
              <PropertyGrid items={similar} />
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <AgentContactCard property={property} />
        </aside>
      </div>
    </div>
  );
}
