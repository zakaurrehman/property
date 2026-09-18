"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/types/action-result";
import { changePasswordSchema, profileSchema, registerSchema } from "../schema";

export async function updateProfile(input: unknown): Promise<ActionResult<null>> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });

  revalidatePath("/profile");
  return { ok: true, data: null };
}

export async function changePassword(input: unknown): Promise<ActionResult<null>> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const record = await db.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  // Google-only accounts have no password to check against.
  if (!record?.passwordHash) {
    return { ok: false, error: "This account signs in with Google and has no password." };
  }

  const matches = await bcrypt.compare(parsed.data.currentPassword, record.passwordHash);
  if (!matches) {
    return {
      ok: false,
      error: "Current password is incorrect.",
      fieldErrors: { currentPassword: ["Current password is incorrect."] },
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });

  return { ok: true, data: null };
}

export async function registerUser(
  input: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const ip = await getClientIp();
  const { success } = await rateLimit(`register:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!success) {
    return { ok: false, error: "Too many attempts — please try again in a minute." };
  }

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      error: "An account with this email already exists.",
      fieldErrors: { email: ["An account with this email already exists."] },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { name, email, phone: phone || undefined, passwordHash, role: "USER" },
  });

  return { ok: true, data: { userId: user.id } };
}
