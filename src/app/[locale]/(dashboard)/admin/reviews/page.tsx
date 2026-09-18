import type { Metadata } from "next";
import { Pencil, Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllReviews } from "@/features/review/server/queries";
import { deleteReview } from "@/features/review/server/actions";
import { ReviewApprovalToggle } from "@/features/review/components/review-approval-toggle";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEnumLabel, formatRelativeDate } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await getAllReviews();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Reviews"
        description="Hidden reviews come first. Approved reviews show on the agent's profile and feed their star rating."
        action={{ href: "/admin/reviews/new", label: "Add review" }}
      />

      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" />
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reviewer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <p className="text-ink-900 font-medium">{review.authorName}</p>
                    <p className="text-ink-500 text-xs">
                      {formatEnumLabel(review.source)} ·{" "}
                      {formatRelativeDate(review.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-ink-300"
                          }`}
                        />
                      ))}
                    </span>
                  </TableCell>
                  <TableCell className="text-ink-600 max-w-sm truncate text-sm">
                    {review.body}
                  </TableCell>
                  <TableCell className="text-sm">
                    {review.agentName ?? <Badge variant="secondary">General</Badge>}
                  </TableCell>
                  <TableCell>
                    <ReviewApprovalToggle
                      reviewId={review.id}
                      isApproved={review.isApproved}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link href={`/admin/reviews/${review.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton
                        id={review.id}
                        action={deleteReview}
                        label={`${review.authorName}'s review`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
