import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Home, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getAdminListings,
  getListingStatusCounts,
} from "@/features/admin/server/queries";
import { deleteProperty } from "@/features/property/server/mutations";
import {
  ListingFlagToggle,
  ListingStatusSelect,
} from "@/features/admin/components/listing-admin-controls";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatPriceShort } from "@/lib/currency";
import { formatEnumLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Listings" };

const filterOrder = [
  "ACTIVE",
  "PENDING",
  "UNDER_OFFER",
  "SOLD",
  "RENTED",
  "EXPIRED",
  "REJECTED",
  "DRAFT",
];

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const [listings, counts] = await Promise.all([
    getAdminListings(status),
    getListingStatusCounts(),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Listings"
        description="Every property on the site. Change status here, or open the editor to change details and photos."
        action={{ href: "/dashboard/listings/new", label: "New listing" }}
      />

      <div className="flex flex-wrap gap-1.5">
        <FilterChip href="/admin/listings" active={!status} label={`All (${total})`} />
        {filterOrder
          .filter((s) => counts[s])
          .map((s) => (
            <FilterChip
              key={s}
              href={`/admin/listings?status=${s}`}
              active={status === s}
              label={`${formatEnumLabel(s)} (${counts[s]})`}
            />
          ))}
      </div>

      {listings.length === 0 ? (
        <EmptyState icon={Home} title="No listings match" />
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead className="hidden xl:table-cell">Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead title="Featured / Hot / Verified">Feat · Hot · Ver</TableHead>
                <TableHead className="hidden 2xl:table-cell">Views / Leads</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-2 relative size-12 shrink-0 overflow-hidden rounded-md">
                        {p.coverImage && (
                          <Image
                            src={p.coverImage}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-ink-900 max-w-[220px] truncate font-medium">
                          {p.title}
                        </p>
                        <p className="text-ink-500 text-xs">
                          {p.refCode} · {p.locationName} ·{" "}
                          {formatPriceShort(p.price, {
                            priceOnRequest: p.priceOnRequest,
                          })}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-ink-600 hidden text-sm xl:table-cell">
                    {p.agentName}
                  </TableCell>
                  <TableCell>
                    <ListingStatusSelect id={p.id} status={p.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ListingFlagToggle
                        id={p.id}
                        flag="isFeatured"
                        value={p.isFeatured}
                        label="Featured"
                      />
                      <ListingFlagToggle
                        id={p.id}
                        flag="isHot"
                        value={p.isHot}
                        label="Hot"
                      />
                      <ListingFlagToggle
                        id={p.id}
                        flag="isVerified"
                        value={p.isVerified}
                        label="Verified"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-ink-600 hidden text-sm 2xl:table-cell">
                    {p.viewCount} / {p.leadCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label="View">
                        <Link href={`/properties/${p.slug}`} target="_blank">
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link href={`/dashboard/listings/${p.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton
                        id={p.id}
                        action={deleteProperty}
                        label={p.title}
                        description="This removes the listing and its photos. Leads it generated are kept but unlinked."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-brand-900 border-brand-900 text-white"
          : "border-line text-ink-600 hover:bg-surface-2",
      )}
    >
      {label}
    </Link>
  );
}
