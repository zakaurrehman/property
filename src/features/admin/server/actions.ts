"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { slugify } from "@/lib/slugify";
import type { ActionResult } from "@/types/action-result";
import { Role } from "@/generated/prisma/enums";

export async function moderateProperty(
  propertyId: string,
  decision: "approve" | "reject",
): Promise<ActionResult<null>> {
  await requireAdmin();

  await db.property.update({
    where: { id: propertyId },
    data:
      decision === "approve"
        ? { status: "ACTIVE", publishedAt: new Date() }
        : { status: "REJECTED" },
  });

  revalidatePath("/admin/moderation");
  revalidatePath("/dashboard/listings");
  return { ok: true, data: null };
}

const roleValues = Object.values(Role) as [string, ...string[]];

export async function updateUserRole(
  userId: string,
  role: string,
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if (!roleValues.includes(role)) {
    return { ok: false, error: "Invalid role." };
  }
  if (userId === admin.id) {
    return { ok: false, error: "You can't change your own role." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { agent: true },
  });
  if (!user) return { ok: false, error: "User not found." };

  await db.user.update({ where: { id: userId }, data: { role: role as Role } });

  if (role === "AGENT" && !user.agent) {
    const baseSlug = slugify(user.name) || `agent-${user.id.slice(0, 6)}`;
    let slug = baseSlug;
    let suffix = 1;
    while (await db.agent.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    await db.agent.create({
      data: {
        userId: user.id,
        slug,
        title: "Property Consultant",
        bio: `${user.name} is a property consultant at Estate Bureau.`,
        photo: user.image ?? "https://picsum.photos/seed/agent-default/400/400",
        phone: user.phone ?? "+923000000000",
        whatsapp: user.phone ?? "+923000000000",
        email: user.email,
        languages: ["English", "Urdu"],
      },
    });
  }

  revalidatePath("/admin/users");
  return { ok: true, data: null };
}
