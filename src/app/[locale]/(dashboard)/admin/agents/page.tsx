import type { Metadata } from "next";
import Image from "next/image";
import { Contact, ExternalLink, Pencil, Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAgents } from "@/features/agent/server/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export const metadata: Metadata = { title: "Agents" };

export default async function AdminAgentsPage() {
  await requireAdmin();
  const agents = await getAgents();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Agents"
        description="Public profiles for /agents. To add an agent, promote a user to AGENT on the Users page — a profile is created automatically, then edit it here."
      />

      {agents.length === 0 ? (
        <EmptyState icon={Contact} title="No agents yet" />
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Specialisations</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-2 relative size-9 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={agent.photo}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-ink-900 font-medium">{agent.name}</p>
                        <p className="text-ink-500 text-xs">{agent.title}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {agent.specialisations.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[11px]">
                          {formatEnumLabel(s)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {agent.rating.toFixed(1)}
                      <span className="text-ink-500">({agent.reviewCount})</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-ink-600 text-sm">
                    {agent.activeListingCount}
                  </TableCell>
                  <TableCell>
                    {agent.isFeatured ? (
                      <Badge className="border-0 bg-amber-500/15 text-amber-700 dark:text-amber-400">
                        Featured
                      </Badge>
                    ) : (
                      <span className="text-ink-400 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label="View">
                        <Link href={`/agents/${agent.slug}`} target="_blank">
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link href={`/admin/agents/${agent.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
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
