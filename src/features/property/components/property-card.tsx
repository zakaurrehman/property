"use client";

import Image from "next/image";
import {
  Bath,
  BedDouble,
  Heart,
  Maximize,
  Phone,
  Scale,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/shared/price-tag";
import { AreaBadge } from "@/components/shared/area-badge";
import { formatRelativeDate } from "@/lib/format";
import { buildTelLink, buildWhatsAppLink, propertyWhatsAppMessage } from "@/lib/whatsapp";
import { useUiStore } from "@/lib/store/ui-store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { cn } from "@/lib/utils";
import type { PropertyCardData } from "../server/queries";

export function PropertyCard({
  property,
  highlighted = false,
  onHover,
}: {
  property: PropertyCardData;
  highlighted?: boolean;
  onHover?: (id: string | null) => void;
}) {
  const cover = property.media[0];
  // Saved/compare state lives in localStorage, which the server can't see —
  // report the SSR-safe default (false) until after hydration so the first
  // client render matches the server's markup exactly.
  const mounted = useHasMounted();
  const storeIsSaved = useUiStore((s) => s.isSaved(property.id));
  const storeIsCompared = useUiStore((s) => s.isCompared(property.id));
  const isSaved = mounted && storeIsSaved;
  const isCompared = mounted && storeIsCompared;
  const toggleSaved = useUiStore((s) => s.toggleSaved);
  const toggleCompare = useUiStore((s) => s.toggleCompare);

  const locationBreadcrumb = [property.location.parent?.name, property.location.name]
    .filter(Boolean)
    .join(" › ");

  return (
    <article
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        "group border-line bg-surface relative flex shrink-0 flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-lg",
        highlighted && "ring-accent-500 ring-2",
      )}
    >
      {/* Fixed height rather than aspect-ratio: aspect-ratio's height
          computation from width is unreliable for this box when it sits
          inside deeply nested grids (e.g. the split-view results grid). */}
      <div className="bg-surface-2 relative h-48 overflow-hidden">
        <Link
          href={`/properties/${property.slug}`}
          className="relative block h-full w-full"
        >
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt ?? property.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="text-ink-400 flex h-full items-center justify-center">
              No photo
            </div>
          )}
        </Link>

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-brand-900 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
            For {property.purpose === "SALE" ? "Sale" : "Rent"}
          </span>
          {property.isVerified && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              <ShieldCheck className="size-3" /> Verified
            </span>
          )}
          {property.isHot && (
            <span className="flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Flame className="size-3" /> Hot
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            aria-label={isSaved ? "Remove from saved" : "Save property"}
            aria-pressed={isSaved}
            onClick={() => toggleSaved(property.id)}
            className={cn(
              "text-ink-600 flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:text-rose-500",
              isSaved && "text-rose-500",
            )}
          >
            <Heart className={cn("size-4", isSaved && "fill-current")} />
          </button>
          <button
            type="button"
            aria-label={isCompared ? "Remove from compare" : "Add to compare"}
            aria-pressed={isCompared}
            onClick={() => toggleCompare(property.id)}
            className={cn(
              "text-ink-600 hover:text-brand-900 flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors",
              isCompared && "text-brand-900",
            )}
          >
            <Scale className="size-4" />
          </button>
        </div>

        <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          {formatRelativeDate(property.publishedAt ?? property.createdAt)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <PriceTag
          price={property.price}
          priceOnRequest={property.priceOnRequest}
          areaSqft={property.areaSqft}
          rentPeriod={property.rentPeriod}
        />

        <Link
          href={`/properties/${property.slug}`}
          className="text-ink-900 hover:text-accent-600 line-clamp-2 font-medium"
        >
          {property.title}
        </Link>

        <p className="text-ink-400 truncate text-xs">{locationBreadcrumb}</p>

        <div className="text-ink-600 flex items-center gap-4 text-sm">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="size-4" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="size-4" /> {property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize className="size-4" />
            <AreaBadge areaSqft={property.areaSqft} />
          </span>
        </div>

        <div className="border-line mt-auto flex items-center gap-2 border-t pt-3">
          <Avatar size="sm">
            <AvatarImage src={property.agent.photo} alt={property.agent.title} />
            <AvatarFallback>{property.agent.title.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 gap-1.5">
            <Button asChild size="icon-sm" variant="outline" aria-label="Call agent">
              <a href={buildTelLink(property.agent.phone)}>
                <Phone className="size-3.5" />
              </a>
            </Button>
            <Button asChild size="sm" variant="secondary" className="flex-1 gap-1.5">
              <a
                href={buildWhatsAppLink(
                  property.agent.whatsapp,
                  propertyWhatsAppMessage(property.refCode, property.title),
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link href={`/properties/${property.slug}`}>Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
