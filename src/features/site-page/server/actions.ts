"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/types/action-result";
import { SITE_PAGE_SLUGS, type SitePageSlug } from "../defaults";
import { sitePageFormSchema, type SitePageFormInput } from "../schema";

export async function saveSitePage(
  slug: string,
  input: SitePageFormInput,
): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();

  if (!(SITE_PAGE_SLUGS as readonly string[]).includes(slug)) {
    return { ok: false, error: "Unknown page." };
  }

  const parsed = sitePageFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Upsert: a DB that was seeded before these pages existed has no row yet,
  // and the edit page pre-fills the built-in default copy in that case.
  await db.sitePage.upsert({
    where: { slug },
    create: { slug, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath(`/${slug as SitePageSlug}`);
  revalidatePath("/admin/pages");
  return { ok: true, data: { slug } };
}
