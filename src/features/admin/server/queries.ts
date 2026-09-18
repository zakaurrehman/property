import "server-only";
import { db } from "@/lib/db";
import { PropertyStatus } from "@/generated/prisma/enums";

export interface AdminStats {
  totalListings: number;
  pendingListings: number;
  totalUsers: number;
  totalAgents: number;
  newLeadsToday: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalListings, pendingListings, totalUsers, totalAgents, newLeadsToday] =
    await Promise.all([
      db.property.count(),
      db.property.count({ where: { status: "PENDING" } }),
      db.user.count(),
      db.agent.count(),
      db.lead.count({ where: { createdAt: { gte: startOfToday } } }),
    ]);

  return { totalListings, pendingListings, totalUsers, totalAgents, newLeadsToday };
}

export interface PendingListingRow {
  id: string;
  refCode: string;
  title: string;
  price: number;
  agentName: string;
  locationName: string;
  coverImage: string | null;
  createdAt: Date;
}

export async function getPendingListings(): Promise<PendingListingRow[]> {
  const properties = await db.property.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      media: { take: 1, orderBy: { sortOrder: "asc" } },
      agent: { select: { user: { select: { name: true } } } },
      location: { select: { name: true } },
    },
  });

  return properties.map((p) => ({
    id: p.id,
    refCode: p.refCode,
    title: p.title,
    price: Number(p.price),
    agentName: p.agent.user.name,
    locationName: p.location.name,
    coverImage: p.media[0]?.url ?? null,
    createdAt: p.createdAt,
  }));
}

export interface AdminListingRow {
  id: string;
  refCode: string;
  slug: string;
  title: string;
  status: string;
  price: number;
  priceOnRequest: boolean;
  coverImage: string | null;
  agentName: string;
  locationName: string;
  isFeatured: boolean;
  isHot: boolean;
  isVerified: boolean;
  viewCount: number;
  leadCount: number;
  updatedAt: Date;
}

const listingStatusValues = Object.values(PropertyStatus);

/** Every listing across all agents, optionally narrowed to one status. */
export async function getAdminListings(status?: string): Promise<AdminListingRow[]> {
  const statusFilter = listingStatusValues.includes(status as PropertyStatus)
    ? (status as PropertyStatus)
    : undefined;

  const properties = await db.property.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: {
      media: { where: { isCover: true }, take: 1 },
      agent: { select: { user: { select: { name: true } } } },
      location: { select: { name: true } },
    },
  });

  return properties.map((p) => ({
    id: p.id,
    refCode: p.refCode,
    slug: p.slug,
    title: p.title,
    status: p.status,
    price: Number(p.price),
    priceOnRequest: p.priceOnRequest,
    coverImage: p.media[0]?.url ?? null,
    agentName: p.agent.user.name,
    locationName: p.location.name,
    isFeatured: p.isFeatured,
    isHot: p.isHot,
    isVerified: p.isVerified,
    viewCount: p.viewCount,
    leadCount: p.leadCount,
    updatedAt: p.updatedAt,
  }));
}

export async function getListingStatusCounts(): Promise<Record<string, number>> {
  const groups = await db.property.groupBy({ by: ["status"], _count: true });
  return Object.fromEntries(groups.map((g) => [g.status, g._count]));
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  hasAgentProfile: boolean;
}

export async function getAllUsers(): Promise<AdminUserRow[]> {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { agent: { select: { id: true } } },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    hasAgentProfile: !!u.agent,
  }));
}
