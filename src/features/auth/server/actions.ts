"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/types/action-result";
import { registerSchema } from "../schema";

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
