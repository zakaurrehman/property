"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/types/action-result";
import { faqFormSchema, type FaqFormInput } from "../schema";

function revalidateFaqs() {
  revalidatePath("/faq");
  revalidatePath("/admin/faqs");
}

export async function createFaq(
  input: FaqFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = faqFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const faq = await db.faq.create({ data: parsed.data });
  revalidateFaqs();
  return { ok: true, data: { id: faq.id } };
}

export async function updateFaq(
  id: string,
  input: FaqFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = faqFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const existing = await db.faq.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { ok: false, error: "FAQ not found." };

  await db.faq.update({ where: { id }, data: parsed.data });
  revalidateFaqs();
  return { ok: true, data: { id } };
}

export async function deleteFaq(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  await db.faq.delete({ where: { id } });
  revalidateFaqs();
  return { ok: true, data: null };
}
