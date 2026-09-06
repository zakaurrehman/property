import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { getPendingListings } from "@/features/admin/server/queries";
import { ModerationActions } from "@/features/admin/components/moderation-actions";
import { formatPriceShort } from "@/lib/currency";
import { formatRelativeDate } from "@/lib/format";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = { title: "Moderation Queue" };

export default async function ModerationPage() {
  const listings = await getPendingListings();

  if (listings.length === 0) {
    return (
      <div className="border-line bg-surface flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
        <ShieldCheck className="text-ink-400 size-10" />
        <p className="text-ink-900 font-medium">All caught up</p>
        <p className="text-ink-600 max-w-sm text-sm">
          No listings are waiting for review right now.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">Moderation queue</h1>

      <div className="flex flex-col gap-3">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="border-line bg-surface flex flex-wrap items-center gap-4 rounded-2xl border p-4"
          >
            <div className="bg-surface-2 relative size-16 shrink-0 overflow-hidden rounded-lg">
              {listing.coverImage && (
                <Image
                  src={listing.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/dashboard/listings/${listing.id}/edit`}
                className="text-ink-900 truncate font-medium hover:underline"
              >
                {listing.title}
              </Link>
              <p className="text-ink-500 text-xs">
                {listing.refCode} · {listing.locationName} · by {listing.agentName} ·{" "}
                {formatRelativeDate(listing.createdAt)}
              </p>
              <p className="text-ink-700 mt-0.5 text-sm font-medium">
                {formatPriceShort(listing.price)}
              </p>
            </div>
            <ModerationActions propertyId={listing.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
