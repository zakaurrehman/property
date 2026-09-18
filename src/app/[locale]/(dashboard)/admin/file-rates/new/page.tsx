import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { FileRateForm } from "@/features/file-rate/components/file-rate-form";
import { createFileRate } from "@/features/file-rate/server/actions";

export const metadata: Metadata = { title: "Add File Rate" };

export default async function NewFileRatePage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">Add file rate</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <FileRateForm mode="create" onSubmit={createFileRate} />
      </div>
    </div>
  );
}
