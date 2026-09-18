"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { parseCommaList, uniqueSlug } from "@/lib/slugify";
import type { ActionResult } from "@/types/action-result";
import { postFormSchema, type PostFormInput } from "../schema";

function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/posts");
  if (slug) revalidatePath(`/blog/${slug}`);
}

const slugTaken = (ignoreId?: string) => async (slug: string) => {
  const hit = await db.post.findUnique({ where: { slug }, select: { id: true } });
  return !!hit && hit.id !== ignoreId;
};

export async function createPost(
  input: PostFormInput,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();

  const parsed = postFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;
  const slug = await uniqueSlug(v.slug || v.title, slugTaken());

  const post = await db.post.create({
    data: {
      slug,
      title: v.title,
      excerpt: v.excerpt,
      contentMdx: v.contentMdx,
      coverImage: v.coverImage,
      tags: parseCommaList(v.tags),
      readingMinutes: v.readingMinutes,
      publishedAt: v.published ? new Date() : null,
      authorId: admin.id,
    },
  });

  revalidateBlog(slug);
  return { ok: true, data: { id: post.id } };
}

export async function updatePost(
  id: string,
  input: PostFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = postFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Post not found." };

  const slug = await uniqueSlug(v.slug || v.title, slugTaken(id));

  await db.post.update({
    where: { id },
    data: {
      slug,
      title: v.title,
      excerpt: v.excerpt,
      contentMdx: v.contentMdx,
      coverImage: v.coverImage,
      tags: parseCommaList(v.tags),
      readingMinutes: v.readingMinutes,
      // Keep the original publish date when re-saving an already-published
      // post so it doesn't jump to the top of the list on every edit.
      publishedAt: v.published ? (existing.publishedAt ?? new Date()) : null,
    },
  });

  revalidateBlog(existing.slug);
  if (slug !== existing.slug) revalidateBlog(slug);
  return { ok: true, data: { id } };
}

export async function deletePost(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  const post = await db.post.delete({ where: { id } });
  revalidateBlog(post.slug);
  return { ok: true, data: null };
}
