import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { getFileRates } from "@/features/file-rate/server/queries";
import { TrendIndicator } from "@/features/file-rate/components/trend-indicator";
import { formatPkrFull } from "@/lib/currency";
import { formatEnumLabel, formatRelativeDate } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "DHA Lahore File Rates",
  description:
    "Live plot file demand rates across DHA Lahore phases — updated regularly by our research team.",
};

export default async function FileRatesPage() {
  const groups = await getFileRates("Lahore");
  const latestUpdate = groups
    .flatMap((g) => g.rows)
    .reduce<Date | null>(
      (latest, row) =>
        !latest || row.effectiveDate > latest ? row.effectiveDate : latest,
      null,
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          DHA Lahore File Rates
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Plot file demand rates across every DHA phase, tracked and updated by our
          research team.
        </p>
        {latestUpdate && (
          <p className="text-ink-500 mt-2 text-xs">
            Last updated {formatRelativeDate(latestUpdate)}
          </p>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={groups[0] ? [groups[0].phase] : []}
        className="flex flex-col gap-3"
      >
        {groups.map((group) => (
          <AccordionItem
            key={group.phase}
            value={group.phase}
            className="border-line bg-surface rounded-2xl border px-4"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="font-heading text-ink-900 font-semibold">
                {group.phase}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {group.locationSlug && (
                <Link
                  href={`/areas/lahore/dha-lahore/${group.locationSlug}`}
                  className="text-accent-600 mb-3 inline-block text-xs font-medium hover:underline"
                >
                  View area guide →
                </Link>
              )}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plot type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>File type</TableHead>
                      <TableHead>Demand</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-sm">{row.plotType}</TableCell>
                        <TableCell className="text-sm">{row.sizeLabel}</TableCell>
                        <TableCell className="text-sm">
                          {formatEnumLabel(row.fileType)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {row.callForPrice || row.demandPkr === null
                            ? "Call for Price"
                            : formatPkrFull(row.demandPkr)}
                        </TableCell>
                        <TableCell className="text-sm">
                          <TrendIndicator trend={row.trend} />
                        </TableCell>
                        <TableCell>
                          <a
                            href={buildWhatsAppLink(
                              row.contactPhone,
                              `Hi, I'm interested in ${row.plotType} ${row.sizeLabel} file rates in ${group.phase}.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-600 inline-flex items-center gap-1 text-sm hover:underline"
                          >
                            <MessageCircle className="size-3.5" />
                            {row.contactName}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
