import type { Metadata } from "next";
import { Briefcase, ExternalLink, Inbox, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllCareers } from "@/features/career/server/queries";
import { deleteCareer } from "@/features/career/server/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export const metadata: Metadata = { title: "Careers" };

export default async function AdminCareersPage() {
  await requireAdmin();
  const careers = await getAllCareers();
  const totalApplications = careers.reduce((n, c) => n + c.applicationCount, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Careers"
        description="Job postings on /careers. Closed jobs keep their applications but aren't listed."
        action={{ href: "/admin/careers/new", label: "Post job" }}
      />

      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/careers/applications">
            <Inbox className="size-4" />
            Applications ({totalApplications})
          </Link>
        </Button>
      </div>

      {careers.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs posted yet" />
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {careers.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <p className="text-ink-900 font-medium">{job.title}</p>
                    <p className="text-ink-500 text-xs">{job.location}</p>
                  </TableCell>
                  <TableCell className="text-ink-600 text-sm">{job.department}</TableCell>
                  <TableCell className="text-ink-600 text-sm">
                    {formatEnumLabel(job.type)}
                  </TableCell>
                  <TableCell>
                    {job.isActive ? (
                      <Badge className="border-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        Open
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Closed</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-ink-600 text-sm">
                    {job.applicationCount}
                  </TableCell>
                  <TableCell className="text-ink-500 text-sm">
                    {formatRelativeDate(job.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {job.isActive && (
                        <Button variant="ghost" size="icon" asChild aria-label="View">
                          <Link href={`/careers/${job.slug}`} target="_blank">
                            <ExternalLink className="size-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link href={`/admin/careers/${job.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton
                        id={job.id}
                        action={deleteCareer}
                        label={job.title}
                        description={
                          job.applicationCount > 0
                            ? `This also deletes its ${job.applicationCount} application${job.applicationCount === 1 ? "" : "s"}. Consider closing it instead.`
                            : "This can't be undone."
                        }
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
