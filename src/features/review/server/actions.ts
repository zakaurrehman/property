"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/types/action-result";
import { reviewFormSchema, type ReviewFormInput } from "../schema";

/**
 * Agent.rating / reviewCount are denormalised from approved reviews so the
 * agent cards don't need an aggregate query per render. Recompute whenever a
 * review that points at an agent is created, edited, approved or deleted.
 */
async function recomputeAgentRating(agentId: string | null | undefined) {
  if (!agentId) return;
  const agg = await db.review.aggregate({
    where: { agentId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await db.agent.update({
    where: { id: agentId },
    data: {
      rating: agg._avg.rating === null ? 0 : Math.round(agg._avg.rating * 10) / 10,
      reviewCount: agg._count,
    },
  });
}

async function revalidateReviews(agentId: string | null | undefined) {
  revalidatePath("/admin/reviews");
  revalidatePath("/agents");
  if (agentId) {
    const agent = await db.agent.findUnique({
      where: { id: agentId },
      select: { slug: true },
    });
    if (agent) revalidatePath(`/agents/${agent.slug}`);
  }
}

function toData(v: ReturnType<typeof reviewFormSchema.parse>) {
  return {
    authorName: v.authorName,
    authorImage: v.authorImage || null,
    rating: v.rating,
    body: v.body,
    source: v.source,
    agentId: v.agentId || null,
    isApproved: v.isApproved,
  };
}

export async function createReview(
  input: ReviewFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = reviewFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const review = await db.review.create({ data: toData(parsed.data) });
  await recomputeAgentRating(review.agentId);
  await revalidateReviews(review.agentId);
  return { ok: true, data: { id: review.id } };
}

export async function updateReview(
  id: string,
  input: ReviewFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = reviewFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await db.review.findUnique({
    where: { id },
    select: { agentId: true },
  });
  if (!existing) return { ok: false, error: "Review not found." };

  const review = await db.review.update({ where: { id }, data: toData(parsed.data) });

  // Re-assigning to a different agent affects both agents' averages.
  await recomputeAgentRating(existing.agentId);
  if (review.agentId !== existing.agentId) await recomputeAgentRating(review.agentId);
  await revalidateReviews(existing.agentId);
  if (review.agentId !== existing.agentId) await revalidateReviews(review.agentId);
  return { ok: true, data: { id } };
}

export async function setReviewApproval(
  id: string,
  isApproved: boolean,
): Promise<ActionResult<null>> {
  await requireAdmin();
  const review = await db.review.update({ where: { id }, data: { isApproved } });
  await recomputeAgentRating(review.agentId);
  await revalidateReviews(review.agentId);
  return { ok: true, data: null };
}

export async function deleteReview(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  const review = await db.review.delete({ where: { id } });
  await recomputeAgentRating(review.agentId);
  await revalidateReviews(review.agentId);
  return { ok: true, data: null };
}
