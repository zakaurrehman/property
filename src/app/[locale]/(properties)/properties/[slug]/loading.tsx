import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="mb-4 h-4 w-64" />
      <Skeleton className="aspect-16/9 w-full rounded-2xl" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}
