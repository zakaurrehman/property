"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Scale } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AreaBadge } from "@/components/shared/area-badge";
import { formatPriceShort, pricePerMarla } from "@/lib/currency";
import { useUiStore } from "@/lib/store/ui-store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { cn } from "@/lib/utils";

interface CompareProperty {
  id: string;
  slug: string;
  refCode: string;
  title: string;
  purpose: "SALE" | "RENT";
  type: string;
  price: string;
  priceOnRequest: boolean;
  areaSqft: number;
  bedrooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  parking: number | null;
  furnishing: string | null;
  facing: string | null;
  possession: string;
  yearBuilt: number | null;
  isVerified: boolean;
  amenities: string[];
  location: { name: string; parent?: { name: string } | null };
  agent: { title: string; user: { name: string } };
  media: { url: string; alt: string | null }[];
}

async function fetchCompareProperties(ids: string[]): Promise<CompareProperty[]> {
  if (ids.length === 0) return [];
  const res = await fetch(`/api/properties/compare?ids=${ids.join(",")}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load comparison");
  const data = (await res.json()) as { items: CompareProperty[] };
  return data.items;
}

const rows: { label: string; render: (p: CompareProperty) => React.ReactNode }[] = [
  { label: "Type", render: (p) => p.type.replace(/_/g, " ") },
  { label: "Bedrooms", render: (p) => p.bedrooms ?? "—" },
  { label: "Bathrooms", render: (p) => p.bathrooms ?? "—" },
  { label: "Floors", render: (p) => p.floors ?? "—" },
  { label: "Parking", render: (p) => p.parking ?? "—" },
  { label: "Furnishing", render: (p) => p.furnishing?.replace(/_/g, " ") ?? "—" },
  { label: "Facing", render: (p) => p.facing?.replace(/_/g, " ") ?? "—" },
  { label: "Possession", render: (p) => p.possession.replace(/_/g, " ") },
  { label: "Year Built", render: (p) => p.yearBuilt ?? "—" },
  { label: "Amenities", render: (p) => p.amenities.length },
];

export default function ComparePage() {
  // compareIds lives in localStorage, invisible to the server — hold it at
  // the SSR-safe default ([]) until after hydration so the first client
  // render matches what the server sent.
  const mounted = useHasMounted();
  const storeCompareIds = useUiStore((s) => s.compareIds);
  const compareIds = mounted ? storeCompareIds : [];
  const toggleCompare = useUiStore((s) => s.toggleCompare);
  const clearCompare = useUiStore((s) => s.clearCompare);

  const { data: items, isLoading } = useQuery({
    queryKey: ["compare", compareIds],
    queryFn: () => fetchCompareProperties(compareIds),
    enabled: compareIds.length > 0,
  });

  const cheapestId = React.useMemo(() => {
    if (!items || items.length < 2) return null;
    const priced = items.filter((p) => !p.priceOnRequest);
    if (priced.length < 2) return null;
    return priced.reduce((min, p) => (BigInt(p.price) < BigInt(min.price) ? p : min)).id;
  }, [items]);

  const largestId = React.useMemo(() => {
    if (!items || items.length < 2) return null;
    return items.reduce((max, p) => (p.areaSqft > max.areaSqft ? p : max)).id;
  }, [items]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-ink-900 text-2xl font-bold sm:text-3xl">
            Compare Properties
          </h1>
          <p className="text-ink-600 mt-1 text-sm">Up to 4 properties, side by side.</p>
        </div>
        {compareIds.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearCompare}>
            Clear all
          </Button>
        )}
      </div>

      {compareIds.length === 0 && (
        <EmptyState
          icon={Scale}
          title="Nothing to compare yet"
          description="Tap the scale icon on any property card to add it here — up to 4 at a time."
          action={
            <Button asChild size="sm">
              <Link href="/properties">Browse properties</Link>
            </Button>
          }
        />
      )}

      {isLoading && compareIds.length > 0 && (
        <p className="text-ink-400 py-16 text-center text-sm">Loading comparison…</p>
      )}

      {items && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-ink-400 w-40 text-left text-xs font-medium" />
                {items.map((p) => (
                  <th key={p.id} className="w-64 px-3 pb-4 text-left align-top">
                    <div className="border-line relative overflow-hidden rounded-xl border">
                      <button
                        type="button"
                        onClick={() => toggleCompare(p.id)}
                        aria-label="Remove from comparison"
                        className="text-ink-600 absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-white/90 shadow-sm hover:text-rose-500"
                      >
                        <X className="size-4" />
                      </button>
                      <div className="relative aspect-4/3">
                        {p.media[0] && (
                          <Image
                            src={p.media[0].url}
                            alt={p.media[0].alt ?? p.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <Link
                          href={`/properties/${p.slug}`}
                          className="text-ink-900 hover:text-accent-600 line-clamp-2 text-sm font-medium"
                        >
                          {p.title}
                        </Link>
                        <p className="text-ink-400 mt-1 text-xs">
                          {p.location.parent?.name ? `${p.location.parent.name} › ` : ""}
                          {p.location.name}
                        </p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-line text-ink-600 border-t py-3 text-sm font-medium">
                  Price
                </td>
                {items.map((p) => (
                  <td
                    key={p.id}
                    className={cn(
                      "border-line border-t px-3 py-3 text-sm font-semibold tabular-nums",
                      p.id === cheapestId
                        ? "bg-emerald-100 text-emerald-500"
                        : "text-ink-900",
                    )}
                  >
                    {formatPriceShort(BigInt(p.price), {
                      priceOnRequest: p.priceOnRequest,
                    })}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-line text-ink-600 border-t py-3 text-sm font-medium">
                  Price / Marla
                </td>
                {items.map((p) => (
                  <td
                    key={p.id}
                    className="border-line text-ink-600 border-t px-3 py-3 text-sm tabular-nums"
                  >
                    {p.priceOnRequest
                      ? "—"
                      : formatPriceShort(pricePerMarla(BigInt(p.price), p.areaSqft))}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-line text-ink-600 border-t py-3 text-sm font-medium">
                  Area
                </td>
                {items.map((p) => (
                  <td
                    key={p.id}
                    className={cn(
                      "border-line border-t px-3 py-3 text-sm font-semibold tabular-nums",
                      p.id === largestId
                        ? "bg-emerald-100 text-emerald-500"
                        : "text-ink-900",
                    )}
                  >
                    <AreaBadge areaSqft={p.areaSqft} />
                  </td>
                ))}
              </tr>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="border-line text-ink-600 border-t py-3 text-sm font-medium">
                    {row.label}
                  </td>
                  {items.map((p) => (
                    <td
                      key={p.id}
                      className="border-line text-ink-900 border-t px-3 py-3 text-sm capitalize"
                    >
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="border-line text-ink-600 border-t py-3 text-sm font-medium">
                  Agent
                </td>
                {items.map((p) => (
                  <td
                    key={p.id}
                    className="border-line text-ink-900 border-t px-3 py-3 text-sm"
                  >
                    {p.agent.user.name}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-line text-ink-600 border-t py-3 text-sm font-medium" />
                {items.map((p) => (
                  <td key={p.id} className="border-line border-t px-3 py-4">
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/properties/${p.slug}`}>View Details</Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
