import type { Metadata } from "next";
import { ExternalLink, Pencil, Wrench } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllServices } from "@/features/service/server/queries";
import { deleteService } from "@/features/service/server/actions";
import { serviceIconMap, FallbackIcon } from "@/lib/lucide-icon";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
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

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await getAllServices();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Services"
        description="Shown on /services and in the header's Services menu, in this order."
        action={{ href: "/admin/services/new", label: "New service" }}
      />

      {services.length === 0 ? (
        <EmptyState icon={Wrench} title="No services yet" />
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => {
                const Icon = serviceIconMap[service.icon] ?? FallbackIcon;
                return (
                  <TableRow key={service.id}>
                    <TableCell className="text-ink-500 text-sm">
                      {service.sortOrder}
                    </TableCell>
                    <TableCell>
                      <span className="text-ink-900 flex items-center gap-2 font-medium">
                        <Icon className="text-accent-600 size-4" />
                        {service.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-ink-600 max-w-sm truncate text-sm">
                      {service.summary}
                    </TableCell>
                    <TableCell className="text-ink-500 text-sm">
                      {formatRelativeDate(service.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild aria-label="View">
                          <Link href={`/services/${service.slug}`} target="_blank">
                            <ExternalLink className="size-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild aria-label="Edit">
                          <Link href={`/admin/services/${service.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <DeleteButton
                          id={service.id}
                          action={deleteService}
                          label={service.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
