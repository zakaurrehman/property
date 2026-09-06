"use server";

import { db } from "@/lib/db";

export interface LocationSearchResult {
  id: string;
  label: string;
  lat: number | null;
  lng: number | null;
}

/** Searches locations by name for the listing wizard's location picker. */
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const locations = await db.location.findMany({
    where: { name: { contains: trimmed, mode: "insensitive" } },
    include: { parent: { select: { name: true } } },
    orderBy: { popularityRank: "asc" },
    take: 15,
  });

  return locations.map((loc) => ({
    id: loc.id,
    label: loc.parent ? `${loc.name}, ${loc.parent.name}` : loc.name,
    lat: loc.lat,
    lng: loc.lng,
  }));
}
