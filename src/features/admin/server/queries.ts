import "server-only";
import { db } from "@/lib/db";

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
