import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getProjectForEdit } from "@/features/project/server/queries";
import { ProjectForm } from "@/features/project/components/project-form";
import { updateProject } from "@/features/project/server/actions";
import { projectStatusOptions } from "@/features/project/schema";

export const metadata: Metadata = { title: "Edit Project" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();

  const project = await getProjectForEdit(id);
  if (!project) notFound();

  const status = (projectStatusOptions as readonly string[]).includes(project.status)
    ? (project.status as (typeof projectStatusOptions)[number])
    : "Selling";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">
        Edit — {project.name}
      </h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <ProjectForm
          mode="edit"
          defaultValues={{
            name: project.name,
            slug: project.slug,
            description: project.description,
            locationText: project.locationText,
            status,
            coverImage: project.coverImage,
            gallery: project.gallery.map((url) => ({ url })),
            completionDate: project.completionDate
              ? project.completionDate.toISOString().slice(0, 10)
              : "",
          }}
          onSubmit={updateProject.bind(null, id)}
        />
      </div>
    </div>
  );
}
