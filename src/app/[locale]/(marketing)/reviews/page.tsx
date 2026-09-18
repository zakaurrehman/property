import type { Metadata } from "next";
import Image from "next/image";
import { Star } from "lucide-react";
import { getAgentOptions, getPublicReviews } from "@/features/review/server/queries";
import { PublicReviewForm } from "@/features/review/components/public-review-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Reviews",
  description: "What buyers, sellers and landlords say about working with Estate Bureau.",
};

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("flex gap-0.5", className)} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < rating ? "fill-amber-400 text-amber-400" : "text-ink-300",
          )}
        />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const [data, agentOptions] = await Promise.all([getPublicReviews(), getAgentOptions()]);
  const { reviews, total, average, distribution } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          Reviews
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          What buyers, sellers and landlords say about working with us.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-6">
          <div className="border-line bg-surface rounded-2xl border p-6 text-center">
            <p className="font-heading text-ink-900 text-5xl font-bold">
              {average === null ? "—" : average.toFixed(1)}
            </p>
            <Stars rating={Math.round(average ?? 0)} className="mt-2 justify-center" />
            <p className="text-ink-500 mt-2 text-sm">
              Based on {total} review{total === 1 ? "" : "s"}
            </p>
            <dl className="mt-5 flex flex-col gap-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star - 1];
                const pct = total === 0 ? 0 : Math.round((count / total) * 100);
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <dt className="text-ink-600 w-8 text-left">{star} ★</dt>
                    <dd className="bg-surface-2 h-2 flex-1 overflow-hidden rounded-full">
                      <span
                        className="block h-full rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </dd>
                    <dd className="text-ink-500 w-8 text-right">{count}</dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="border-line bg-surface rounded-2xl border p-6">
            <h2 className="font-heading text-ink-900 mb-1 text-lg font-bold">
              Leave a review
            </h2>
            <p className="text-ink-600 mb-4 text-sm">
              Worked with us recently? We publish every genuine review, good or bad.
            </p>
            <PublicReviewForm agentOptions={agentOptions} />
          </div>
        </aside>

        <main>
          {reviews.length === 0 ? (
            <EmptyState icon={Star} title="No reviews published yet" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="border-line bg-surface flex flex-col gap-3 rounded-2xl border p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-surface-2 relative size-10 shrink-0 overflow-hidden rounded-full">
                      {review.authorImage ? (
                        <Image
                          src={review.authorImage}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-ink-600 flex size-full items-center justify-center text-sm font-semibold">
                          {review.authorName.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-ink-900 truncate font-medium">
                        {review.authorName}
                      </p>
                      <p className="text-ink-500 text-xs">
                        {formatRelativeDate(review.createdAt)}
                      </p>
                    </div>
                    {review.source === "GOOGLE" && (
                      <Badge variant="secondary">Google</Badge>
                    )}
                  </div>
                  <Stars rating={review.rating} />
                  <p className="text-ink-700 text-sm leading-relaxed">{review.body}</p>
                  {review.agentName && review.agentSlug && (
                    <p className="text-ink-500 mt-auto text-xs">
                      Worked with{" "}
                      <Link
                        href={`/agents/${review.agentSlug}`}
                        className="text-accent-600 hover:underline"
                      >
                        {review.agentName}
                      </Link>
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
