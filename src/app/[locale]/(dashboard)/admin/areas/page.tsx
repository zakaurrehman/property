import type { Metadata } from "next";
import { ExternalLink, MapPin, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getLocationTree } from "@/features/location/server/queries";
import { deleteLocation } from "@/features/location/server/mutations";
import { ImportReferenceButton } from "@/features/location/components/import-reference-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPriceShort } from "@/lib/currency";
import { formatEnumLabel } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Areas" };

export default async function AdminAreasPage() {
  await requireAdmin();
  const locations = await getLocationTree();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Areas"
        description="The city → society → phase tree behind /areas, the location picker, and property search."
        action={{ href: "/admin/areas/new", label: "New area" }}
      />

      {locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No areas yet"
          description="Listings and file rates need a phase or society to attach to. Load the standard DHA Lahore phases and major societies in one click, then add blocks or sectors as you need them."
          action={<ImportReferenceButton variant="default" />}
        />
      ) : (
        <>
          <div className="flex justify-end">
            <ImportReferenceButton />
          </div>
          <div className="border-line overflow-x-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Avg / Marla</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>File rates</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell>
                      <span
                        className="text-ink-900 flex items-center gap-2 font-medium"
                        style={{ paddingInlineStart: `${loc.depth * 1.25}rem` }}
                      >
                        {loc.depth > 0 && <span className="text-ink-300">└</span>}
                        {loc.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatEnumLabel(loc.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-ink-600 text-sm">
                      {loc.avgPricePerMarla === null
                        ? "—"
                        : formatPriceShort(loc.avgPricePerMarla)}
                    </TableCell>
                    <TableCell className="text-ink-600 text-sm">
                      {loc.propertyCount}
                    </TableCell>
                    <TableCell className="text-ink-600 text-sm">
                      {loc.fileRateCount}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild aria-label="View">
                          <Link href={`/areas/lahore/${loc.slug}`} target="_blank">
                            <ExternalLink className="size-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild aria-label="Edit">
                          <Link href={`/admin/areas/${loc.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <DeleteButton
                          id={loc.id}
                          action={deleteLocation}
                          label={loc.name}
                          description="Only empty areas can be deleted — move its listings, file rates and sub-areas first."
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
