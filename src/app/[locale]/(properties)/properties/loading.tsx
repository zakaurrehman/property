import { PropertyGridSkeleton } from "@/components/shared/property-card-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-16" />
      <PropertyGridSkeleton count={9} />
    </div>
  );
}
