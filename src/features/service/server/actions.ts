"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { uniqueSlug } from "@/lib/slugify";
import type { ActionResult } from "@/types/action-result";
import { serviceFormSchema, type ServiceFormInput } from "../schema";

function revalidateServices(slug?: string) {
  revalidatePath("/services");
  revalidatePath("/admin/services");
  if (slug) revalidatePath(`/services/${slug}`);
}

const slugTaken = (ignoreId?: string) => async (slug: string) => {
  const hit = await db.service.findUnique({ where: { slug }, select: { id: true } });
  return !!hit && hit.id !== ignoreId;
};

export async function createService(
  input: ServiceFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = serviceFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;
  const slug = await uniqueSlug(v.slug || v.name, slugTaken());

  const service = await db.service.create({
    data: {
      slug,
      name: v.name,
      summary: v.summary,
      descriptionMdx: v.descriptionMdx,
      icon: v.icon,
      gallery: v.gallery.map((g) => g.url),
      sortOrder: v.sortOrder,
    },
  });

  revalidateServices(slug);
  return { ok: true, data: { id: service.id } };
}

export async function updateService(
  id: string,
  input: ServiceFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = serviceFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;

  const existing = await db.service.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Service not found." };

  const slug = await uniqueSlug(v.slug || v.name, slugTaken(id));

  await db.service.update({
    where: { id },
    data: {
      slug,
      name: v.name,
      summary: v.summary,
      descriptionMdx: v.descriptionMdx,
      icon: v.icon,
      gallery: v.gallery.map((g) => g.url),
      sortOrder: v.sortOrder,
    },
  });

  revalidateServices(existing.slug);
  if (slug !== existing.slug) revalidateServices(slug);
  return { ok: true, data: { id } };
}

export async function deleteService(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  const service = await db.service.delete({ where: { id } });
  revalidateServices(service.slug);
  return { ok: true, data: null };
}
