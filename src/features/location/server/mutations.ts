"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { uniqueSlug } from "@/lib/slugify";
import type { ActionResult } from "@/types/action-result";
import { locationFormSchema, type LocationFormInput } from "../schema";

function revalidateAreas() {
  revalidatePath("/areas");
  revalidatePath("/areas/[...slug]", "page");
  revalidatePath("/admin/areas");
}

const slugTaken = (ignoreId?: string) => async (slug: string) => {
  const hit = await db.location.findUnique({ where: { slug }, select: { id: true } });
  return !!hit && hit.id !== ignoreId;
};

function toData(v: ReturnType<typeof locationFormSchema.parse>, slug: string) {
  return {
    slug,
    name: v.name,
    nameUr: v.nameUr || null,
    type: v.type,
    parentId: v.parentId || null,
    description: v.description || null,
    heroImage: v.heroImage || null,
    mapImageUrl: v.mapImageUrl || null,
    avgPricePerMarla:
      v.avgPricePerMarla === undefined ? null : BigInt(Math.round(v.avgPricePerMarla)),
    lat: v.lat ?? null,
    lng: v.lng ?? null,
    popularityRank: v.popularityRank === undefined ? null : Math.round(v.popularityRank),
  };
}

export async function createLocation(
  input: LocationFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = locationFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const slug = await uniqueSlug(parsed.data.slug || parsed.data.name, slugTaken());
  const location = await db.location.create({ data: toData(parsed.data, slug) });

  revalidateAreas();
  return { ok: true, data: { id: location.id } };
}

export async function updateLocation(
  id: string,
  input: LocationFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = locationFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  if (parsed.data.parentId === id) {
    return {
      ok: false,
      error: "An area can't be its own parent.",
      fieldErrors: { parentId: ["Pick a different parent"] },
    };
  }

  const existing = await db.location.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Area not found." };

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.name, slugTaken(id));
  await db.location.update({ where: { id }, data: toData(parsed.data, slug) });

  revalidateAreas();
  return { ok: true, data: { id } };
}

export async function deleteLocation(id: string): Promise<ActionResult<null>> {
  await requireAdmin();

  const location = await db.location.findUnique({
    where: { id },
    include: {
      _count: { select: { children: true, properties: true, fileRates: true } },
    },
  });
  if (!location) return { ok: false, error: "Area not found." };

  const { children, properties, fileRates } = location._count;
  if (children > 0 || properties > 0 || fileRates > 0) {
    const blockers = [
      children > 0 && `${children} sub-area${children === 1 ? "" : "s"}`,
      properties > 0 && `${properties} listing${properties === 1 ? "" : "s"}`,
      fileRates > 0 && `${fileRates} file rate${fileRates === 1 ? "" : "s"}`,
    ].filter(Boolean);
    return {
      ok: false,
      error: `Can't delete ${location.name} — it still has ${blockers.join(", ")}. Move or delete those first.`,
    };
  }

  await db.location.delete({ where: { id } });
  revalidateAreas();
  return { ok: true, data: null };
}
