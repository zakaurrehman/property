import "server-only";
import { db } from "@/lib/db";

export interface LeadRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  status: string;
  propertyTitle: string | null;
  propertySlug: string | null;
  agentName: string | null;
  createdAt: Date;
}

function toLeadRow(
  lead: Awaited<ReturnType<typeof db.lead.findMany>>[number] & {
    property?: { title: string; slug: string } | null;
    agent?: { user: { name: string } } | null;
  },
): LeadRow {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    message: lead.message,
    source: lead.source,
    status: lead.status,
    propertyTitle: lead.property?.title ?? null,
    propertySlug: lead.property?.slug ?? null,
    agentName: lead.agent?.user.name ?? null,
    createdAt: lead.createdAt,
  };
}

export async function getAgentLeads(agentId: string): Promise<LeadRow[]> {
  const leads = await db.lead.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    include: { property: { select: { title: true, slug: true } } },
  });
  return leads.map(toLeadRow);
}

export async function getAllLeads(): Promise<LeadRow[]> {
  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      property: { select: { title: true, slug: true } },
      agent: { select: { user: { select: { name: true } } } },
    },
  });
  return leads.map(toLeadRow);
}
