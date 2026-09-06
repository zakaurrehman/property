import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAgent } from "@/lib/auth/guards";
import { getPropertyForEdit } from "@/features/property/server/dashboard-queries";
import { ListingForm } from "@/features/property/components/listing-form";
import { updateProperty } from "@/features/property/server/mutations";

export const metadata: Metadata = { title: "Edit Listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, agent } = await requireAgent();

  const result = await getPropertyForEdit(
    id,
    user.role === "ADMIN" ? undefined : agent?.id,
  );
  if (!result) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-ink-900 text-2xl font-bold">Edit listing</h1>
        <p className="text-ink-600 mt-1 text-sm">
          Changes are saved immediately — no re-review needed.
        </p>
      </div>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <ListingForm
          mode="edit"
          defaultValues={result.input}
          defaultLocationLabel={result.locationLabel}
          onSubmit={(values) => updateProperty(id, values)}
        />
      </div>
    </div>
  );
}
