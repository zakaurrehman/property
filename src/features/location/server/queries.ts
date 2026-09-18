import "server-only";
import { db } from "@/lib/db";
import {
  propertyCardInclude,
  type PropertyCardData,
} from "@/features/property/server/queries";

export interface AreaIndexItem {
  id: string;
  slug: string;
  name: string;
  type: string;
  heroImage: string | null;
  avgPricePerMarla: number | null;
  propertyCount: number;
  phaseCount: number;
}

/** Top-level societies (DHA + standalone societies), each shown as a card on /areas. */
export async function getAreaIndex(): Promise<AreaIndexItem[]> {
  const lahore = await db.location.findUnique({ where: { slug: "lahore" } });
  if (!lahore) return [];

  const societies = await db.location.findMany({
    where: { parentId: lahore.id, type: "SOCIETY" },
    orderBy: { popularityRank: "asc" },
    include: {
      _count: { select: { properties: true, children: true } },
    },
  });

  return societies.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    type: s.type,
    heroImage: s.heroImage,
    avgPricePerMarla: s.avgPricePerMarla === null ? null : Number(s.avgPricePerMarla),
    propertyCount: s._count.properties,
    phaseCount: s._count.children,
  }));
}

export interface LocationBreadcrumb {
  slug: string;
  name: string;
}

export interface LocationGuide {
  id: string;
  slug: string;
  name: string;
  nameUr: string | null;
  type: string;
  description: string | null;
  heroImage: string | null;
  avgPricePerMarla: number | null;
  lat: number | null;
  lng: number | null;
  breadcrumbs: LocationBreadcrumb[];
  children: { slug: string; name: string; propertyCount: number }[];
  /** This location's own id plus every descendant's id (recursively) — a
   * society-level guide (e.g. "DHA Lahore") has no properties of its own;
   * they're attached to its phase children, so property lookups need the
   * whole subtree, not just an exact locationId match. */
  descendantLocationIds: string[];
}

/** BFS over the location tree — shallow (city -> society -> phase, depth 3) so a few round trips is fine. */
async function getDescendantLocationIds(rootId: string): Promise<string[]> {
  const ids = [rootId];
  let frontier = [rootId];
  while (frontier.length > 0) {
    const children = await db.location.findMany({
      where: { parentId: { in: frontier } },
      select: { id: true },
    });
    if (children.length === 0) break;
    frontier = children.map((c) => c.id);
    ids.push(...frontier);
  }
  return ids;
}

async function getBreadcrumbs(locationId: string | null): Promise<LocationBreadcrumb[]> {
  const trail: LocationBreadcrumb[] = [];
  let currentId = locationId;
  while (currentId) {
    const loc = await db.location.findUnique({
      where: { id: currentId },
      select: { slug: true, name: true, parentId: true },
    });
    if (!loc) break;
    trail.unshift({ slug: loc.slug, name: loc.name });
    currentId = loc.parentId;
  }
  return trail;
}

export async function getLocationGuide(slug: string): Promise<LocationGuide | null> {
  const location = await db.location.findUnique({
    where: { slug },
    include: {
      children: {
        orderBy: { popularityRank: "asc" },
        include: { _count: { select: { properties: true } } },
      },
    },
  });
  if (!location) return null;

  const [breadcrumbs, descendantLocationIds] = await Promise.all([
    getBreadcrumbs(location.parentId),
    getDescendantLocationIds(location.id),
  ]);

  return {
    id: location.id,
    slug: location.slug,
    name: location.name,
    nameUr: location.nameUr,
    type: location.type,
    description: location.description,
    heroImage: location.heroImage,
    avgPricePerMarla:
      location.avgPricePerMarla === null ? null : Number(location.avgPricePerMarla),
    lat: location.lat,
    lng: location.lng,
    breadcrumbs,
    children: location.children.map((c) => ({
      slug: c.slug,
      name: c.name,
      propertyCount: c._count.properties,
    })),
    descendantLocationIds,
  };
}

export interface AdminLocationRow {
  id: string;
  slug: string;
  name: string;
  type: string;
  depth: number;
  propertyCount: number;
  fileRateCount: number;
  childCount: number;
  avgPricePerMarla: number | null;
  updatedAt: Date;
}

/** Whole location tree flattened depth-first, so the admin table can indent by depth. */
export async function getLocationTree(): Promise<AdminLocationRow[]> {
  const all = await db.location.findMany({
    orderBy: [{ popularityRank: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { properties: true, fileRates: true, children: true } },
    },
  });

  const byParent = new Map<string | null, typeof all>();
  for (const loc of all) {
    const key = loc.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(loc);
  }

  const rows: AdminLocationRow[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const loc of byParent.get(parentId) ?? []) {
      rows.push({
        id: loc.id,
        slug: loc.slug,
        name: loc.name,
        type: loc.type,
        depth,
        propertyCount: loc._count.properties,
        fileRateCount: loc._count.fileRates,
        childCount: loc._count.children,
        avgPricePerMarla:
          loc.avgPricePerMarla === null ? null : Number(loc.avgPricePerMarla),
        updatedAt: loc.updatedAt,
      });
      walk(loc.id, depth + 1);
    }
  };
  walk(null, 0);
  return rows;
}

export interface LocationParentOption {
  id: string;
  label: string;
}

export async function getLocationParentOptions(): Promise<LocationParentOption[]> {
  const tree = await getLocationTree();
  return tree.map((l) => ({ id: l.id, label: `${"— ".repeat(l.depth)}${l.name}` }));
}

export async function getLocationForEdit(id: string) {
  const l = await db.location.findUnique({ where: { id } });
  if (!l) return null;
  return {
    id: l.id,
    name: l.name,
    nameUr: l.nameUr,
    slug: l.slug,
    type: l.type,
    parentId: l.parentId,
    description: l.description,
    heroImage: l.heroImage,
    mapImageUrl: l.mapImageUrl,
    avgPricePerMarla: l.avgPricePerMarla === null ? null : Number(l.avgPricePerMarla),
    lat: l.lat,
    lng: l.lng,
    popularityRank: l.popularityRank,
  };
}

const AREA_PAGE_SIZE = 24;

export async function getPropertiesForLocationIds(
  locationIds: string[],
  page = 1,
): Promise<{ items: PropertyCardData[]; totalCount: number }> {
  const where = { locationId: { in: locationIds }, status: "ACTIVE" as const };
  const [rawItems, totalCount] = await Promise.all([
    db.property.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * AREA_PAGE_SIZE,
      take: AREA_PAGE_SIZE,
      include: propertyCardInclude,
    }),
    db.property.count({ where }),
  ]);

  return {
    items: rawItems.map((p) => ({
      ...p,
      agent: { ...p.agent, rating: Number(p.agent.rating) },
    })),
    totalCount,
  };
}
