"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { uniqueSlug } from "@/lib/slugify";
import type { ActionResult } from "@/types/action-result";
import { projectFormSchema, type ProjectFormInput } from "../schema";

function revalidateProjects(slug?: string) {
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

const slugTaken = (ignoreId?: string) => async (slug: string) => {
  const hit = await db.project.findUnique({ where: { slug }, select: { id: true } });
  return !!hit && hit.id !== ignoreId;
};

function toData(v: ReturnType<typeof projectFormSchema.parse>, slug: string) {
  return {
    slug,
    name: v.name,
    description: v.description,
    locationText: v.locationText,
    status: v.status,
    coverImage: v.coverImage,
    gallery: v.gallery.map((g) => g.url),
    completionDate: v.completionDate ? new Date(v.completionDate) : null,
  };
}

export async function createProject(
  input: ProjectFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = projectFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const slug = await uniqueSlug(parsed.data.slug || parsed.data.name, slugTaken());
  const project = await db.project.create({ data: toData(parsed.data, slug) });

  revalidateProjects(slug);
  return { ok: true, data: { id: project.id } };
}

export async function updateProject(
  id: string,
  input: ProjectFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = projectFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await db.project.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Project not found." };

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.name, slugTaken(id));
  await db.project.update({ where: { id }, data: toData(parsed.data, slug) });

  revalidateProjects(existing.slug);
  if (slug !== existing.slug) revalidateProjects(slug);
  return { ok: true, data: { id } };
}

export async function deleteProject(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  const project = await db.project.delete({ where: { id } });
  revalidateProjects(project.slug);
  return { ok: true, data: null };
}
