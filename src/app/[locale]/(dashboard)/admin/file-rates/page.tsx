import type { Metadata } from "next";
import { Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllFileRates } from "@/features/file-rate/server/queries";
import { deleteFileRate } from "@/features/file-rate/server/actions";
import { TrendIndicator } from "@/features/file-rate/components/trend-indicator";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPkrFull } from "@/lib/currency";
import { formatEnumLabel, formatRelativeDate } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "File Rates" };

export default async function AdminFileRatesPage() {
  await requireAdmin();
  const rates = await getAllFileRates();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="File Rates"
        description="Plot file demand rates shown on /file-rates. Changing a price records a history point and sets the trend automatically."
        action={{ href: "/admin/file-rates/new", label: "Add rate" }}
      />

      {rates.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No file rates yet" />
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phase</TableHead>
                <TableHead>Plot</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Demand</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="text-ink-900 font-medium">{rate.phase}</TableCell>
                  <TableCell className="text-sm">
                    {rate.sizeLabel} · {rate.plotType}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatEnumLabel(rate.fileType)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {rate.callForPrice || rate.demandPkr === null
                      ? "Call for price"
                      : formatPkrFull(rate.demandPkr)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <TrendIndicator trend={rate.trend} />
                  </TableCell>
                  <TableCell className="text-ink-600 text-sm">
                    {rate.contactName}
                  </TableCell>
                  <TableCell className="text-ink-500 text-sm">
                    {formatRelativeDate(rate.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link href={`/admin/file-rates/${rate.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton
                        id={rate.id}
                        action={deleteFileRate}
                        label={`${rate.phase} ${rate.sizeLabel} rate`}
                        description="This also removes its price history."
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
