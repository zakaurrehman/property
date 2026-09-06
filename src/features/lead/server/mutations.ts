"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/auth/guards";
import type { ActionResult } from "@/types/action-result";
import { LeadStatus } from "@/generated/prisma/enums";

const leadStatusValues = Object.values(LeadStatus) as [string, ...string[]];

export async function updateLeadStatus(
  leadId: string,
  status: string,
): Promise<ActionResult<null>> {
  const { user, agent } = await requireAgent();
  if (!leadStatusValues.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    select: { agentId: true },
  });
  if (!lead) return { ok: false, error: "Lead not found." };
  if (user.role !== "ADMIN" && lead.agentId !== agent?.id) {
    return { ok: false, error: "You don't have permission to update this lead." };
  }

  await db.lead.update({
    where: { id: leadId },
    data: { status: status as (typeof LeadStatus)[keyof typeof LeadStatus] },
  });

  revalidatePath("/dashboard/leads");
  revalidatePath("/admin/leads");
  return { ok: true, data: null };
}
