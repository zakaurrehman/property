import { Home } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PropertyCard } from "./property-card";
import type { PropertyCardData } from "../server/queries";

export function PropertyGrid({ items }: { items: PropertyCardData[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title="No properties match your search"
        description="Try widening your price range, removing a filter, or searching a nearby phase."
      />
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      aria-live="polite"
    >
      {items.map((property, i) => (
        <PropertyCard key={property.id} property={property} priority={i < 3} />
      ))}
    </div>
  );
}
