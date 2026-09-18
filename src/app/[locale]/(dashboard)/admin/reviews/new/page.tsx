import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getAgentOptions } from "@/features/review/server/queries";
import { ReviewForm } from "@/features/review/components/review-form";
import { createReview } from "@/features/review/server/actions";

export const metadata: Metadata = { title: "Add Review" };

export default async function NewReviewPage() {
  await requireAdmin();
  const agentOptions = await getAgentOptions();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">Add review</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <ReviewForm mode="create" agentOptions={agentOptions} onSubmit={createReview} />
      </div>
    </div>
  );
}
