import "server-only";
import { db } from "@/lib/db";
import {
  propertyCardInclude,
  type PropertyCardData,
} from "@/features/property/server/queries";

function serializeAgent<T extends { rating: unknown }>(agent: T) {
  return { ...agent, rating: Number(agent.rating) };
}

export interface AgentListItem {
  id: string;
  slug: string;
  name: string;
  title: string;
  photo: string;
  whatsapp: string;
  specialisations: string[];
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  activeListingCount: number;
}

export async function getAgents(): Promise<AgentListItem[]> {
  const agents = await db.agent.findMany({
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
    include: {
      user: { select: { name: true } },
      _count: { select: { properties: { where: { status: "ACTIVE" } } } },
    },
  });

  return agents.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.user.name,
    title: a.title,
    photo: a.photo,
    whatsapp: a.whatsapp,
    specialisations: a.specialisations,
    yearsExperience: a.yearsExperience,
    rating: Number(a.rating),
    reviewCount: a.reviewCount,
    isFeatured: a.isFeatured,
    activeListingCount: a._count.properties,
  }));
}

export interface AgentReview {
  id: string;
  authorName: string;
  authorImage: string | null;
  rating: number;
  body: string;
  createdAt: Date;
}

export interface AgentDetail {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  photo: string;
  phone: string;
  whatsapp: string;
  email: string;
  specialisations: string[];
  languages: string[];
  yearsExperience: number;
  areasServed: string[];
  rating: number;
  reviewCount: number;
  socials: unknown;
  listings: PropertyCardData[];
  reviews: AgentReview[];
}

export async function getAgentBySlug(slug: string): Promise<AgentDetail | null> {
  const agent = await db.agent.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true } },
      properties: { where: { status: "ACTIVE" }, include: propertyCardInclude, take: 24 },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!agent) return null;

  const { properties, reviews, user, ...rest } = agent;

  return {
    ...serializeAgent(rest),
    name: user.name,
    listings: properties.map((p) => ({
      ...p,
      agent: { ...p.agent, rating: Number(p.agent.rating) },
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      authorImage: r.authorImage,
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt,
    })),
  };
}
