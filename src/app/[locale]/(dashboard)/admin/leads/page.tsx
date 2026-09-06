import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { getAllLeads } from "@/features/lead/server/queries";
import { LeadStatusSelect } from "@/features/lead/components/lead-status-select";
import { formatRelativeDate } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "All Leads" };

export default async function AdminLeadsPage() {
  const leads = await getAllLeads();

  if (leads.length === 0) {
    return (
      <div className="border-line bg-surface flex flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
        <Inbox className="text-ink-400 size-10" />
        <p className="text-ink-900 font-medium">No leads yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">All leads</h1>

      <div className="border-line overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <p className="text-ink-900 text-sm font-medium">{lead.name}</p>
                  <p className="text-ink-500 text-xs">{lead.phone}</p>
                </TableCell>
                <TableCell className="text-sm">
                  {lead.propertySlug ? (
                    <Link
                      href={`/properties/${lead.propertySlug}`}
                      className="hover:underline"
                    >
                      {lead.propertyTitle}
                    </Link>
                  ) : (
                    <span className="text-ink-500">—</span>
                  )}
                </TableCell>
                <TableCell className="text-ink-600 text-sm">
                  {lead.agentName ?? "Unassigned"}
                </TableCell>
                <TableCell className="text-ink-500 text-sm">{lead.source}</TableCell>
                <TableCell className="text-ink-500 text-sm whitespace-nowrap">
                  {formatRelativeDate(lead.createdAt)}
                </TableCell>
                <TableCell>
                  <LeadStatusSelect leadId={lead.id} status={lead.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
