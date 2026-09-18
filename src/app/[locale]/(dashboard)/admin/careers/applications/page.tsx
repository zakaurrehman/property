import type { Metadata } from "next";
import { ArrowLeft, FileText, Inbox } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllApplications } from "@/features/career/server/queries";
import { ApplicationStatusSelect } from "@/features/career/components/application-status-select";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/format";
import { buildTelLink, buildWhatsAppLink } from "@/lib/whatsapp";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Applications" };

export default async function AdminApplicationsPage() {
  await requireAdmin();
  const applications = await getAllApplications();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Job Applications"
        description="Newest first. Update the status as you screen, interview and hire."
      />
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/careers">
            <ArrowLeft className="size-4" />
            Back to jobs
          </Link>
        </Button>
      </div>

      {applications.length === 0 ? (
        <EmptyState icon={Inbox} title="No applications yet" />
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>CV</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <p className="text-ink-900 font-medium">{app.name}</p>
                    {app.coverLetter && (
                      <p
                        className="text-ink-500 max-w-xs truncate text-xs"
                        title={app.coverLetter}
                      >
                        {app.coverLetter}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-ink-600 text-sm">
                    {app.careerTitle}
                  </TableCell>
                  <TableCell className="text-sm">
                    <a
                      href={`mailto:${app.email}`}
                      className="text-accent-600 block hover:underline"
                    >
                      {app.email}
                    </a>
                    <span className="text-ink-500 flex gap-2 text-xs">
                      <a href={buildTelLink(app.phone)} className="hover:underline">
                        {app.phone}
                      </a>
                      <a
                        href={buildWhatsAppLink(
                          app.phone,
                          `Hi ${app.name}, thanks for applying for ${app.careerTitle} at Estate Bureau.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        WhatsApp
                      </a>
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={app.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-600 inline-flex items-center gap-1 text-sm hover:underline"
                    >
                      <FileText className="size-3.5" />
                      Open
                    </a>
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusSelect id={app.id} status={app.status} />
                  </TableCell>
                  <TableCell className="text-ink-500 text-sm">
                    {formatRelativeDate(app.createdAt)}
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
