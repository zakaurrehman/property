import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { ProjectForm } from "@/features/project/components/project-form";
import { createProject } from "@/features/project/server/actions";

export const metadata: Metadata = { title: "New Project" };

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">New project</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <ProjectForm mode="create" onSubmit={createProject} />
      </div>
    </div>
  );
}
