import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { CareerForm } from "@/features/career/components/career-form";
import { createCareer } from "@/features/career/server/actions";

export const metadata: Metadata = { title: "Post Job" };

export default async function NewCareerPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">Post a job</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <CareerForm mode="create" onSubmit={createCareer} />
      </div>
    </div>
  );
}
