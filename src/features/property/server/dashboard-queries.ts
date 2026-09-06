import "server-only";
import { db } from "@/lib/db";
import { fromSqft, type AreaUnit } from "@/lib/units";
import type { PropertyFormInput } from "../listing-schema";

export interface AgentListingRow {
  id: string;
  refCode: string;
  slug: string;
  title: string;
  status: string;
  purpose: string;
  price: number;
  areaSqft: number;
  coverImage: string | null;
  viewCount: number;
  leadCount: number;
  createdAt: Date;
}

/** Listings owned by this agent (or, for admins, every listing when agentId is omitted). */
export async function getAgentListings(
  agentId: string | undefined,
): Promise<AgentListingRow[]> {
  const properties = await db.property.findMany({
    where: agentId ? { agentId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { media: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  return properties.map((p) => ({
    id: p.id,
    refCode: p.refCode,
    slug: p.slug,
    title: p.title,
    status: p.status,
    purpose: p.purpose,
    price: Number(p.price),
    areaSqft: p.areaSqft,
    coverImage: p.media[0]?.url ?? null,
    viewCount: p.viewCount,
    leadCount: p.leadCount,
    createdAt: p.createdAt,
  }));
}

export interface AgentDashboardStats {
  activeListings: number;
  pendingListings: number;
  totalViews: number;
  newLeads: number;
}

export async function getAgentDashboardStats(
  agentId: string,
): Promise<AgentDashboardStats> {
  const [activeListings, pendingListings, viewAgg, newLeads] = await Promise.all([
    db.property.count({ where: { agentId, status: "ACTIVE" } }),
    db.property.count({ where: { agentId, status: "PENDING" } }),
    db.property.aggregate({ where: { agentId }, _sum: { viewCount: true } }),
    db.lead.count({ where: { agentId, status: "NEW" } }),
  ]);

  return {
    activeListings,
    pendingListings,
    totalViews: viewAgg._sum.viewCount ?? 0,
    newLeads,
  };
}

/** Loads a property owned by this agent (or any, for admins) as listing-form default values. */
export async function getPropertyForEdit(
  propertyId: string,
  agentId: string | undefined,
): Promise<{ input: PropertyFormInput; locationLabel: string } | null> {
  const property = await db.property.findUnique({
    where: { id: propertyId },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      location: { include: { parent: { select: { name: true } } } },
    },
  });
  if (!property) return null;
  if (agentId && property.agentId !== agentId) return null;

  const unit = property.areaUnitDisplay as AreaUnit;

  return {
    locationLabel: property.location.parent
      ? `${property.location.name}, ${property.location.parent.name}`
      : property.location.name,
    input: {
      title: property.title,
      description: property.description,
      purpose: property.purpose,
      type: property.type,
      category: property.category,
      price: Number(property.price),
      priceOnRequest: property.priceOnRequest,
      rentPeriod: property.rentPeriod ?? undefined,
      sizeValue: Number(fromSqft(property.areaSqft, unit).toFixed(2)),
      sizeUnit: unit,
      bedrooms: property.bedrooms ?? undefined,
      bathrooms: property.bathrooms ?? undefined,
      floors: property.floors ?? undefined,
      parking: property.parking ?? undefined,
      yearBuilt: property.yearBuilt ?? undefined,
      furnishing: property.furnishing ?? undefined,
      facing: property.facing ?? undefined,
      plotNo: property.plotNo ?? "",
      streetNo: property.streetNo ?? "",
      possession: property.possession,
      fileType: property.fileType ?? undefined,
      locationId: property.locationId,
      address: property.address,
      lat: property.lat ?? undefined,
      lng: property.lng ?? undefined,
      amenities: property.amenities,
      videoUrl: property.videoUrl ?? "",
      images: property.media.map((m) => ({ url: m.url, alt: m.alt ?? undefined })),
    },
  };
}
