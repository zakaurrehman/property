import type { Metadata } from "next";
import Image from "next/image";
import { Building, ExternalLink, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllProjects } from "@/features/project/server/queries";
import { deleteProject } from "@/features/project/server/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
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

export const metadata: Metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  await requireAdmin();
  const projects = await getAllProjects();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Projects"
        description="Developments shown on /projects."
        action={{ href: "/admin/projects/new", label: "New project" }}
      />

      {projects.length === 0 ? (
        <EmptyState icon={Building} title="No projects yet" />
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-surface-2 relative size-10 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={project.coverImage}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-ink-900 font-medium">{project.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-ink-600 text-sm">
                    {project.locationText}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{project.status}</Badge>
                  </TableCell>
                  <TableCell className="text-ink-500 text-sm">
                    {formatRelativeDate(project.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label="View">
                        <Link href={`/projects/${project.slug}`} target="_blank">
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link href={`/admin/projects/${project.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton
                        id={project.id}
                        action={deleteProject}
                        label={project.name}
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
