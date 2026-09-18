import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getCareerForEdit } from "@/features/career/server/queries";
import { CareerForm } from "@/features/career/components/career-form";
import { updateCareer } from "@/features/career/server/actions";

export const metadata: Metadata = { title: "Edit Job" };

export default async function EditCareerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();

  const job = await getCareerForEdit(id);
  if (!job) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">Edit — {job.title}</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <CareerForm
          mode="edit"
          defaultValues={{
            title: job.title,
            slug: job.slug,
            department: job.department,
            location: job.location,
            type: job.type,
            description: job.description,
            isActive: job.isActive,
          }}
          onSubmit={updateCareer.bind(null, id)}
        />
      </div>
    </div>
  );
}
