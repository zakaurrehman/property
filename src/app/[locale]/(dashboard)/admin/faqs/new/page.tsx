import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllFaqs } from "@/features/faq/server/queries";
import { FaqForm } from "@/features/faq/components/faq-form";
import { createFaq } from "@/features/faq/server/actions";

export const metadata: Metadata = { title: "Add FAQ" };

export default async function NewFaqPage() {
  await requireAdmin();
  const categories = [...new Set((await getAllFaqs()).map((f) => f.category))];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">Add FAQ</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <FaqForm mode="create" categories={categories} onSubmit={createFaq} />
      </div>
    </div>
  );
}
