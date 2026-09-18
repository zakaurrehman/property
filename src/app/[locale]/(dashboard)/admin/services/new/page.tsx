import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { ServiceForm } from "@/features/service/components/service-form";
import { createService } from "@/features/service/server/actions";

export const metadata: Metadata = { title: "New Service" };

export default async function NewServicePage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">New service</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <ServiceForm mode="create" onSubmit={createService} />
      </div>
    </div>
  );
}
