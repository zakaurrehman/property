import "server-only";
import { db } from "@/lib/db";

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
