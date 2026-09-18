"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { parseCommaList } from "@/lib/slugify";
import type { ActionResult } from "@/types/action-result";
import { agentFormSchema, type AgentFormInput } from "../schema";

export async function updateAgent(
  id: string,
  input: AgentFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = agentFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;

  const existing = await db.agent.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return { ok: false, error: "Agent not found." };

  await db.agent.update({
    where: { id },
    data: {
      title: v.title,
      bio: v.bio,
      photo: v.photo,
      phone: v.phone,
      whatsapp: v.whatsapp,
      email: v.email,
      specialisations: v.specialisations,
      languages: parseCommaList(v.languages),
      yearsExperience: v.yearsExperience,
      areasServed: parseCommaList(v.areasServed),
      isFeatured: v.isFeatured,
      // Keep the header/user-menu avatar in sync with the public profile photo.
      user: { update: { image: v.photo } },
    },
  });

  revalidatePath("/agents");
  revalidatePath(`/agents/${existing.slug}`);
  revalidatePath("/admin/agents");
  return { ok: true, data: { id } };
}
