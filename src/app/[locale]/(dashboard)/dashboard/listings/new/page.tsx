import type { Metadata } from "next";
import { requireAgent } from "@/lib/auth/guards";
import { ListingForm } from "@/features/property/components/listing-form";
import { createProperty } from "@/features/property/server/mutations";

export const metadata: Metadata = { title: "List a Property" };

export default async function NewListingPage() {
  await requireAgent();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-ink-900 text-2xl font-bold">List a property</h1>
        <p className="text-ink-600 mt-1 text-sm">
          New listings are reviewed by our team before going live — usually within a few
          hours.
        </p>
      </div>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <ListingForm mode="create" onSubmit={createProperty} />
      </div>
    </div>
  );
}
