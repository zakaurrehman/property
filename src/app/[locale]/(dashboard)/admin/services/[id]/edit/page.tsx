import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getServiceForEdit } from "@/features/service/server/queries";
import { ServiceForm } from "@/features/service/components/service-form";
import { updateService } from "@/features/service/server/actions";

export const metadata: Metadata = { title: "Edit Service" };

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();

  const service = await getServiceForEdit(id);
  if (!service) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">
        Edit — {service.name}
      </h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <ServiceForm
          mode="edit"
          defaultValues={{
            name: service.name,
            slug: service.slug,
            summary: service.summary,
            descriptionMdx: service.descriptionMdx,
            icon: service.icon,
            gallery: service.gallery.map((url) => ({ url })),
            sortOrder: service.sortOrder,
          }}
          onSubmit={updateService.bind(null, id)}
        />
      </div>
    </div>
  );
}
