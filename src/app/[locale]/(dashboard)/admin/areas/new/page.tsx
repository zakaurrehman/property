import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getLocationParentOptions } from "@/features/location/server/queries";
import { LocationForm } from "@/features/location/components/location-form";
import { createLocation } from "@/features/location/server/mutations";

export const metadata: Metadata = { title: "New Area" };

export default async function NewAreaPage() {
  await requireAdmin();
  const parentOptions = await getLocationParentOptions();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">New area</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <LocationForm
          mode="create"
          parentOptions={parentOptions}
          onSubmit={createLocation}
        />
      </div>
    </div>
  );
}
