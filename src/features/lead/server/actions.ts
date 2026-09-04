"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result";
import { propertyEnquirySchema } from "../schema";

export async function createPropertyEnquiry(
  input: unknown,
): Promise<ActionResult<{ leadId: string }>> {
  const parsed = propertyEnquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { propertyId, name, phone, email, message } = parsed.data;

  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { id: true, purpose: true, agentId: true },
  });
  if (!property) {
    return { ok: false, error: "This property is no longer available." };
  }

  const lead = await db.lead.create({
    data: {
      propertyId: property.id,
      agentId: property.agentId,
      name,
      phone,
      email: email || undefined,
      message: message || undefined,
      source: "FORM",
      purpose: property.purpose,
      status: "NEW",
    },
  });

  await db.property.update({
    where: { id: property.id },
    data: { leadCount: { increment: 1 } },
  });

  return { ok: true, data: { leadId: lead.id } };
}
