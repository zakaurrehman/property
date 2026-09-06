"use client";

import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PropertyGridSkeleton } from "@/components/shared/property-card-skeleton";
import { PropertyGrid } from "@/features/property/components/property-grid";
import type { PropertyCardData } from "@/features/property/server/queries";
import { useUiStore } from "@/lib/store/ui-store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";

async function fetchSavedProperties(ids: string[]): Promise<PropertyCardData[]> {
  if (ids.length === 0) return [];
  const res = await fetch(`/api/properties/saved?ids=${ids.join(",")}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load saved properties");
  const data = (await res.json()) as {
    items: (Omit<PropertyCardData, "price"> & { price: string })[];
  };
  return data.items.map((item) => ({ ...item, price: BigInt(item.price) }));
}

export default function SavedPage() {
  // savedIds lives in localStorage, invisible to the server — hold it at
  // the SSR-safe default ([]) until after hydration so the first client
  // render matches what the server sent.
  const mounted = useHasMounted();
  const storeSavedIds = useUiStore((s) => s.savedIds);
  const savedIds = mounted ? storeSavedIds : [];

  const { data: items, isLoading } = useQuery({
    queryKey: ["saved-properties", savedIds],
    queryFn: () => fetchSavedProperties(savedIds),
    enabled: savedIds.length > 0,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-ink-900 text-2xl font-bold sm:text-3xl">
          Saved Properties
        </h1>
        <p className="text-ink-600 mt-1 text-sm">
          {savedIds.length} {savedIds.length === 1 ? "property" : "properties"} saved on
          this device.
        </p>
      </div>

      {savedIds.length === 0 && (
        <EmptyState
          icon={Heart}
          title="No saved properties yet"
          description="Tap the heart icon on any listing to save it here for later."
          action={
            <Button asChild size="sm">
              <Link href="/properties">Browse properties</Link>
            </Button>
          }
        />
      )}

      {isLoading && savedIds.length > 0 && (
        <PropertyGridSkeleton count={savedIds.length} />
      )}

      {items && items.length > 0 && <PropertyGrid items={items} />}
    </div>
  );
}
