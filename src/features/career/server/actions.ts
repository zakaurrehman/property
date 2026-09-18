"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";
import { uniqueSlug } from "@/lib/slugify";
import { LeadNotificationEmail } from "@/emails/lead-notification-email";
import type { ActionResult } from "@/types/action-result";
import type { ApplicationStatus } from "@/generated/prisma/enums";
import {
  applicationSchema,
  applicationStatusOptions,
  careerFormSchema,
  type ApplicationInput,
  type CareerFormInput,
} from "../schema";

function revalidateCareers(slug?: string) {
  revalidatePath("/careers");
  revalidatePath("/admin/careers");
  if (slug) revalidatePath(`/careers/${slug}`);
}

const slugTaken = (ignoreId?: string) => async (slug: string) => {
  const hit = await db.career.findUnique({ where: { slug }, select: { id: true } });
  return !!hit && hit.id !== ignoreId;
};

// ── Admin: job postings ──────────────────────────────────────────────────

export async function createCareer(
  input: CareerFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = careerFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { slug: rawSlug, ...data } = parsed.data;
  const slug = await uniqueSlug(rawSlug || data.title, slugTaken());
  const career = await db.career.create({ data: { ...data, slug } });
  revalidateCareers(slug);
  return { ok: true, data: { id: career.id } };
}

export async function updateCareer(
  id: string,
  input: CareerFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = careerFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const existing = await db.career.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return { ok: false, error: "Job not found." };

  const { slug: rawSlug, ...data } = parsed.data;
  const slug = await uniqueSlug(rawSlug || data.title, slugTaken(id));
  await db.career.update({ where: { id }, data: { ...data, slug } });

  revalidateCareers(existing.slug);
  if (slug !== existing.slug) revalidateCareers(slug);
  return { ok: true, data: { id } };
}

export async function deleteCareer(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  const career = await db.career.delete({ where: { id } });
  revalidateCareers(career.slug);
  return { ok: true, data: null };
}

export async function setApplicationStatus(
  id: string,
  status: string,
): Promise<ActionResult<null>> {
  await requireAdmin();
  if (!(applicationStatusOptions as string[]).includes(status)) {
    return { ok: false, error: "Invalid status." };
  }
  await db.careerApplication.update({
    where: { id },
    data: { status: status as ApplicationStatus },
  });
  revalidatePath("/admin/careers/applications");
  return { ok: true, data: null };
}

// ── Public: apply ────────────────────────────────────────────────────────

export async function submitApplication(
  input: ApplicationInput,
): Promise<ActionResult<{ id: string }>> {
  const ip = await getClientIp();
  const { success } = await rateLimit(`apply:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!success) {
    return { ok: false, error: "Too many submissions — please try again in a minute." };
  }

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  if (parsed.data.company) {
    return { ok: true, data: { id: "discarded" } };
  }

  const { careerId, name, email, phone, cvUrl, coverLetter } = parsed.data;
  const career = await db.career.findUnique({
    where: { id: careerId },
    select: { id: true, title: true, isActive: true },
  });
  if (!career || !career.isActive) {
    return { ok: false, error: "This position is no longer open." };
  }

  const application = await db.careerApplication.create({
    data: { careerId, name, email, phone, cvUrl, coverLetter: coverLetter || null },
  });

  await sendEmail({
    to: siteConfig.email,
    subject: `New application: ${career.title}`,
    react: LeadNotificationEmail({
      leadName: name,
      leadPhone: phone,
      leadEmail: email,
      message: `CV: ${cvUrl}${coverLetter ? `\n\n${coverLetter}` : ""}`,
      source: `Careers — ${career.title}`,
    }),
  });

  revalidatePath("/admin/careers/applications");
  return { ok: true, data: { id: application.id } };
}
