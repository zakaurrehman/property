import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { areaFilterToSqft, type PropertySearchParams } from "../schema";

const PAGE_SIZE = 12;

function buildWhere(params: PropertySearchParams): Prisma.PropertyWhereInput {
  const { min: areaMin, max: areaMax } = areaFilterToSqft(params);

  const where: Prisma.PropertyWhereInput = {
    status: "ACTIVE",
  };

  if (params.ref) {
    where.refCode = { equals: params.ref, mode: "insensitive" };
    return where;
  }

  if (params.purpose) where.purpose = params.purpose;
  if (params.type?.length) where.type = { in: params.type };
  if (params.category) where.category = params.category;
  if (params.furnishing) where.furnishing = params.furnishing;
  if (params.fileType) where.fileType = params.fileType;
  if (params.verifiedOnly) where.isVerified = true;
  if (params.beds !== undefined) where.bedrooms = { gte: params.beds };
  if (params.baths !== undefined) where.bathrooms = { gte: params.baths };

  if (params.priceMin !== undefined || params.priceMax !== undefined) {
    where.price = {
      ...(params.priceMin !== undefined
        ? { gte: BigInt(Math.round(params.priceMin)) }
        : {}),
      ...(params.priceMax !== undefined
        ? { lte: BigInt(Math.round(params.priceMax)) }
        : {}),
    };
  }

  if (areaMin !== undefined || areaMax !== undefined) {
    where.areaSqft = {
      ...(areaMin !== undefined ? { gte: Math.round(areaMin) } : {}),
      ...(areaMax !== undefined ? { lte: Math.round(areaMax) } : {}),
    };
  }

  if (params.location) {
    where.location = {
      OR: [
        { slug: params.location },
        { slug: { contains: params.location, mode: "insensitive" } },
      ],
    };
  }

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { address: { contains: params.q, mode: "insensitive" } },
      { refCode: { contains: params.q, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildOrderBy(
  sort: PropertySearchParams["sort"],
): Prisma.PropertyOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "area-asc":
      return [{ areaSqft: "asc" }];
    case "area-desc":
      return [{ areaSqft: "desc" }];
    case "popular":
      return [{ viewCount: "desc" }];
    case "newest":
    default:
      return [{ publishedAt: "desc" }, { createdAt: "desc" }];
  }
}

export const propertyCardInclude = {
  location: {
    select: {
      id: true,
      slug: true,
      name: true,
      parent: { select: { name: true, slug: true } },
    },
  },
  agent: {
    select: {
      id: true,
      slug: true,
      title: true,
      photo: true,
      phone: true,
      whatsapp: true,
      rating: true,
    },
  },
  media: { where: { isCover: true }, take: 1 },
} satisfies Prisma.PropertyInclude;

type RawPropertyCard = Prisma.PropertyGetPayload<{ include: typeof propertyCardInclude }>;

/**
 * Prisma's `Decimal` (agent.rating) isn't a plain object, so it can't cross
 * the Server -> Client Component boundary — Next silently drops it instead
 * of throwing, which breaks anything downstream that reads it. Coerce it to
 * a plain number here, once, for every card/detail payload.
 */
function serializePropertyCard(item: RawPropertyCard) {
  return { ...item, agent: { ...item.agent, rating: Number(item.agent.rating) } };
}

export type PropertyCardData = ReturnType<typeof serializePropertyCard>;

export async function searchProperties(params: PropertySearchParams) {
  const where = buildWhere(params);
  const orderBy = buildOrderBy(params.sort);
  const skip = (params.page - 1) * PAGE_SIZE;

  const [rawItems, totalCount, purposeFacets, typeFacets] = await Promise.all([
    db.property.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: propertyCardInclude,
    }),
    db.property.count({ where }),
    db.property.groupBy({ by: ["purpose"], where: { status: "ACTIVE" }, _count: true }),
    db.property.groupBy({ by: ["type"], where: { status: "ACTIVE" }, _count: true }),
  ]);

  const items = rawItems.map(serializePropertyCard);
  const nextPage = skip + items.length < totalCount ? params.page + 1 : null;

  return {
    items,
    totalCount,
    page: params.page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    nextPage,
    facets: {
      purpose: Object.fromEntries(purposeFacets.map((f) => [f.purpose, f._count])),
      type: Object.fromEntries(typeFacets.map((f) => [f.type, f._count])),
    },
  };
}

export const propertyDetailInclude = {
  location: { include: { parent: { include: { parent: true } } } },
  agent: { include: { user: { select: { name: true, image: true } } } },
  media: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.PropertyInclude;

type RawPropertyDetail = Prisma.PropertyGetPayload<{
  include: typeof propertyDetailInclude;
}>;

function serializePropertyDetail(item: RawPropertyDetail) {
  return { ...item, agent: { ...item.agent, rating: Number(item.agent.rating) } };
}

export type PropertyDetailData = ReturnType<typeof serializePropertyDetail>;

export async function getPropertyBySlug(
  slug: string,
): Promise<PropertyDetailData | null> {
  const property = await db.property.findUnique({
    where: { slug },
    include: propertyDetailInclude,
  });
  return property ? serializePropertyDetail(property) : null;
}

export async function incrementPropertyViewCount(id: string): Promise<void> {
  await db.property.update({ where: { id }, data: { viewCount: { increment: 1 } } });
}

export async function getSimilarProperties(
  property: PropertyDetailData,
  limit = 4,
): Promise<PropertyCardData[]> {
  const items = await db.property.findMany({
    where: {
      id: { not: property.id },
      status: "ACTIVE",
      purpose: property.purpose,
      OR: [{ locationId: property.locationId }, { type: property.type }],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: propertyCardInclude,
  });
  return items.map(serializePropertyCard);
}
