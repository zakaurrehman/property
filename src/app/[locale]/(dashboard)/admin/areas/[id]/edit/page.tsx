import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getLocationForEdit,
  getLocationParentOptions,
} from "@/features/location/server/queries";
import { LocationForm } from "@/features/location/components/location-form";
import { updateLocation } from "@/features/location/server/mutations";

export const metadata: Metadata = { title: "Edit Area" };

export default async function EditAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();

  const [location, parentOptions] = await Promise.all([
    getLocationForEdit(id),
    getLocationParentOptions(),
  ]);
  if (!location) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">
        Edit — {location.name}
      </h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <LocationForm
          mode="edit"
          // An area can't be its own parent — drop it from the options.
          parentOptions={parentOptions.filter((p) => p.id !== id)}
          defaultValues={{
            name: location.name,
            nameUr: location.nameUr ?? "",
            slug: location.slug,
            type: location.type,
            parentId: location.parentId ?? "",
            description: location.description ?? "",
            heroImage: location.heroImage ?? "",
            mapImageUrl: location.mapImageUrl ?? "",
            avgPricePerMarla: location.avgPricePerMarla ?? ("" as unknown as number),
            lat: location.lat ?? ("" as unknown as number),
            lng: location.lng ?? ("" as unknown as number),
            popularityRank: location.popularityRank ?? ("" as unknown as number),
          }}
          onSubmit={updateLocation.bind(null, id)}
        />
      </div>
    </div>
  );
}
