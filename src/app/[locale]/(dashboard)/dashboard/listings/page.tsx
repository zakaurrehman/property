import type { Metadata } from "next";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { requireAgent } from "@/lib/auth/guards";
import { getAgentListings } from "@/features/property/server/dashboard-queries";
import { formatPriceShort } from "@/lib/currency";
import { formatAreaLabel } from "@/lib/units";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ListingActions } from "@/features/property/components/listing-actions";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "My Listings" };

export default async function DashboardListingsPage() {
  const { user, agent } = await requireAgent();
  const listings = await getAgentListings(user.role === "ADMIN" ? undefined : agent?.id);

  if (listings.length === 0) {
    return (
      <div className="border-line bg-surface flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
        <Building2 className="text-ink-400 size-10" />
        <p className="text-ink-900 font-medium">No listings yet</p>
        <p className="text-ink-600 max-w-sm text-sm">
          Create your first listing to start receiving enquiries from buyers and renters.
        </p>
        <Button asChild className="mt-2">
          <Link href="/dashboard/listings/new">List a property</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-ink-900 text-2xl font-bold">My Listings</h1>
        <Button asChild>
          <Link href="/dashboard/listings/new">List a property</Link>
        </Button>
      </div>

      <div className="border-line overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="bg-surface-2 relative size-12 shrink-0 overflow-hidden rounded-md">
                      {row.coverImage && (
                        <Image
                          src={row.coverImage}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-ink-900 truncate text-sm font-medium">
                        {row.title}
                      </p>
                      <p className="text-ink-500 text-xs">{row.refCode}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-sm">{formatPriceShort(row.price)}</TableCell>
                <TableCell className="text-sm">{formatAreaLabel(row.areaSqft)}</TableCell>
                <TableCell className="text-sm">
                  {row.viewCount.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm">{row.leadCount}</TableCell>
                <TableCell>
                  <ListingActions id={row.id} slug={row.slug} status={row.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
