import "server-only";
import { db } from "@/lib/db";

export interface PublicReview {
  id: string;
  authorName: string;
  authorImage: string | null;
  rating: number;
  body: string;
  source: string;
  agentName: string | null;
  agentSlug: string | null;
  createdAt: Date;
}

export interface PublicReviewsData {
  reviews: PublicReview[];
  total: number;
  average: number | null;
  /** Count per star, index 0 = 1 star … index 4 = 5 stars. */
  distribution: number[];
}

export async function getPublicReviews(): Promise<PublicReviewsData> {
  const [reviews, agg, byRating] = await Promise.all([
    db.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { agent: { select: { slug: true, user: { select: { name: true } } } } },
    }),
    db.review.aggregate({
      where: { isApproved: true },
      _count: true,
      _avg: { rating: true },
    }),
    db.review.groupBy({ by: ["rating"], where: { isApproved: true }, _count: true }),
  ]);

  const distribution = [0, 0, 0, 0, 0];
  for (const r of byRating) {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1] = r._count;
  }

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      authorImage: r.authorImage,
      rating: r.rating,
      body: r.body,
      source: r.source,
      agentName: r.agent?.user.name ?? null,
      agentSlug: r.agent?.slug ?? null,
      createdAt: r.createdAt,
    })),
    total: agg._count,
    average: agg._avg.rating === null ? null : Math.round(agg._avg.rating * 10) / 10,
    distribution,
  };
}

export interface AdminReviewRow {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  source: string;
  isApproved: boolean;
  agentName: string | null;
  createdAt: Date;
}

export async function getAllReviews(): Promise<AdminReviewRow[]> {
  const reviews = await db.review.findMany({
    orderBy: [{ isApproved: "asc" }, { createdAt: "desc" }],
    include: { agent: { select: { user: { select: { name: true } } } } },
  });
  return reviews.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    body: r.body,
    source: r.source,
    isApproved: r.isApproved,
    agentName: r.agent?.user.name ?? null,
    createdAt: r.createdAt,
  }));
}

export async function getReviewForEdit(id: string) {
  const r = await db.review.findUnique({ where: { id } });
  if (!r) return null;
  return {
    id: r.id,
    authorName: r.authorName,
    authorImage: r.authorImage,
    rating: r.rating,
    body: r.body,
    source: r.source,
    agentId: r.agentId,
    isApproved: r.isApproved,
  };
}

export interface AgentOption {
  id: string;
  name: string;
}

export async function getAgentOptions(): Promise<AgentOption[]> {
  const agents = await db.agent.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  });
  return agents.map((a) => ({ id: a.id, name: a.user.name }));
}
