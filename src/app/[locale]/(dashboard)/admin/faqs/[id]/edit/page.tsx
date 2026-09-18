import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllFaqs, getFaqForEdit } from "@/features/faq/server/queries";
import { FaqForm } from "@/features/faq/components/faq-form";
import { updateFaq } from "@/features/faq/server/actions";

export const metadata: Metadata = { title: "Edit FAQ" };

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();

  const [faq, all] = await Promise.all([getFaqForEdit(id), getAllFaqs()]);
  if (!faq) notFound();
  const categories = [...new Set(all.map((f) => f.category))];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">Edit FAQ</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <FaqForm
          mode="edit"
          categories={categories}
          defaultValues={{
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            sortOrder: faq.sortOrder,
            isPublished: faq.isPublished,
          }}
          onSubmit={updateFaq.bind(null, id)}
        />
      </div>
    </div>
  );
}
