import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getAgentOptions, getReviewForEdit } from "@/features/review/server/queries";
import { ReviewForm } from "@/features/review/components/review-form";
import { updateReview } from "@/features/review/server/actions";

export const metadata: Metadata = { title: "Edit Review" };

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();

  const [review, agentOptions] = await Promise.all([
    getReviewForEdit(id),
    getAgentOptions(),
  ]);
  if (!review) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">Edit review</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <ReviewForm
          mode="edit"
          agentOptions={agentOptions}
          defaultValues={{
            authorName: review.authorName,
            authorImage: review.authorImage ?? "",
            rating: review.rating,
            body: review.body,
            source: review.source,
            agentId: review.agentId ?? "",
            isApproved: review.isApproved,
          }}
          onSubmit={updateReview.bind(null, id)}
        />
      </div>
    </div>
  );
}
