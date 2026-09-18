"use client";

import * as React from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { List, MapIcon, Columns2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyGrid } from "./property-grid";
import { PropertyCard } from "./property-card";
import dynamic from "next/dynamic";

// MapLibre is ~300 KiB of JS; only the split/map views need it, so keep it
// out of the list view's bundle and render it client-side on demand.
const PropertyMap = dynamic(
  () => import("@/features/map/components/property-map").then((m) => m.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface-2 border-line h-full w-full animate-pulse rounded-2xl border" />
    ),
  },
);
import type { PropertyCardData } from "../server/queries";

const viewOptions = ["list", "map", "split"] as const;

export function PropertySearchResults({ items }: { items: PropertyCardData[] }) {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(viewOptions).withDefault("list"),
  );
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const mapProperties = React.useMemo(
    () =>
      items
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          refCode: p.refCode,
          lat: p.lat as number,
          lng: p.lng as number,
          price: p.price,
          priceOnRequest: p.priceOnRequest,
          purpose: p.purpose,
        })),
    [items],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="border-line bg-surface inline-flex rounded-lg border p-0.5">
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            className="gap-1.5"
            onClick={() => setView("list")}
          >
            <List className="size-4" /> List
          </Button>
          <Button
            variant={view === "split" ? "default" : "ghost"}
            size="sm"
            className="hidden gap-1.5 sm:inline-flex"
            onClick={() => setView("split")}
          >
            <Columns2 className="size-4" /> Split
          </Button>
          <Button
            variant={view === "map" ? "default" : "ghost"}
            size="sm"
            className="gap-1.5"
            onClick={() => setView("map")}
          >
            <MapIcon className="size-4" /> Map
          </Button>
        </div>
      </div>

      {view === "list" && <PropertyGrid items={items} />}

      {view === "map" && (
        <PropertyMap
          properties={mapProperties}
          hoveredId={hoveredId}
          onHoverPin={setHoveredId}
          className="border-line h-[70vh] w-full overflow-hidden rounded-2xl border"
        />
      )}

      {view === "split" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.length === 0 ? (
            <PropertyGrid items={items} />
          ) : (
            <div className="flex max-h-[calc(100vh-14rem)] flex-col gap-5 overflow-y-auto pr-1">
              {items.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  highlighted={property.id === hoveredId}
                  onHover={setHoveredId}
                />
              ))}
            </div>
          )}
          <PropertyMap
            properties={mapProperties}
            hoveredId={hoveredId}
            onHoverPin={setHoveredId}
            className="border-line sticky top-24 h-[calc(100vh-14rem)] w-full overflow-hidden rounded-2xl border"
          />
        </div>
      )}
    </div>
  );
}
