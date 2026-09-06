"use server";

import { db } from "@/lib/db";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";
import { LeadNotificationEmail } from "@/emails/lead-notification-email";
import { LeadConfirmationEmail } from "@/emails/lead-confirmation-email";
import type { ActionResult } from "@/types/action-result";
import {
  propertyEnquirySchema,
  contactFormSchema,
  valuationRequestSchema,
  chatLeadSchema,
} from "../schema";

export async function createPropertyEnquiry(
  input: unknown,
): Promise<ActionResult<{ leadId: string }>> {
  const ip = await getClientIp();
  const { success } = await rateLimit(`enquiry:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!success) {
    return {
      ok: false,
      error: "Too many enquiries sent — please try again in a minute.",
    };
  }

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
    select: {
      id: true,
      purpose: true,
      agentId: true,
      title: true,
      refCode: true,
      slug: true,
      agent: { select: { email: true } },
    },
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
      ip,
    },
  });

  await db.property.update({
    where: { id: property.id },
    data: { leadCount: { increment: 1 } },
  });

  const propertyUrl = `${siteConfig.url}/properties/${property.slug}`;

  await Promise.all([
    sendEmail({
      to: property.agent.email,
      subject: `New enquiry: ${property.title}`,
      react: LeadNotificationEmail({
        leadName: name,
        leadPhone: phone,
        leadEmail: email || undefined,
        message: message || undefined,
        propertyTitle: property.title,
        propertyRefCode: property.refCode,
        propertyUrl,
        source: "Property enquiry form",
      }),
    }),
    email
      ? sendEmail({
          to: email,
          subject: `We've got your enquiry — ${siteConfig.name}`,
          react: LeadConfirmationEmail({ leadName: name, propertyTitle: property.title }),
        })
      : Promise.resolve(),
  ]);

  return { ok: true, data: { leadId: lead.id } };
}

export async function submitContactForm(
  input: unknown,
): Promise<ActionResult<{ leadId: string }>> {
  const ip = await getClientIp();
  const { success } = await rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!success) {
    return { ok: false, error: "Too many messages sent — please try again in a minute." };
  }

  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  if (parsed.data.company) {
    // Honeypot tripped — pretend success so the bot moves on.
    return { ok: true, data: { leadId: "discarded" } };
  }

  const { name, phone, email, message, department } = parsed.data;

  const lead = await db.lead.create({
    data: {
      name,
      phone,
      email: email || undefined,
      message: `[${department}] ${message}`,
      source: "CONTACT_PAGE",
      status: "NEW",
      ip,
    },
  });

  await sendEmail({
    to: siteConfig.email,
    subject: `New contact form message — ${department}`,
    react: LeadNotificationEmail({
      leadName: name,
      leadPhone: phone,
      leadEmail: email || undefined,
      message,
      source: `Contact page (${department})`,
    }),
  });

  return { ok: true, data: { leadId: lead.id } };
}

export async function submitValuationRequest(
  input: unknown,
): Promise<ActionResult<{ valuationId: string }>> {
  const ip = await getClientIp();
  const { success } = await rateLimit(`valuation:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!success) {
    return { ok: false, error: "Too many requests sent — please try again in a minute." };
  }

  const parsed = valuationRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  if (parsed.data.company) {
    return { ok: true, data: { valuationId: "discarded" } };
  }

  const { name, phone, email, propertyType, locationText, sizeMarla, message } =
    parsed.data;

  const valuation = await db.valuation.create({
    data: {
      name,
      phone,
      email: email || undefined,
      propertyType,
      locationText,
      sizeMarla,
      message: message || undefined,
      status: "NEW",
    },
  });

  await sendEmail({
    to: siteConfig.email,
    subject: `New valuation request — ${locationText}`,
    react: LeadNotificationEmail({
      leadName: name,
      leadPhone: phone,
      leadEmail: email || undefined,
      message: `${propertyType.replace(/_/g, " ")} in ${locationText}${sizeMarla ? `, ~${sizeMarla} Marla` : ""}.${message ? ` ${message}` : ""}`,
      source: "Free valuation request",
    }),
  });

  return { ok: true, data: { valuationId: valuation.id } };
}

export async function createChatLead(
  input: unknown,
): Promise<ActionResult<{ leadId: string }>> {
  const ip = await getClientIp();
  const { success } = await rateLimit(`chat:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!success) {
    return { ok: false, error: "Too many requests — please try again shortly." };
  }

  const parsed = chatLeadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, phone, purpose, intent, size, budget } = parsed.data;
  const intentLabel = {
    BUY: "Buy",
    RENT: "Rent",
    PLOT_FILE: "Plot file",
    CONSTRUCTION: "Construction",
  }[intent];

  const lead = await db.lead.create({
    data: {
      name,
      phone,
      purpose,
      message: `Advisor chat — Intent: ${intentLabel}${size ? `, Size: ${size}` : ""}${budget ? `, Budget: ${budget}` : ""}`,
      source: "CHAT",
      status: "NEW",
      ip,
    },
  });

  await sendEmail({
    to: siteConfig.email,
    subject: `New advisor chat lead — ${intentLabel}`,
    react: LeadNotificationEmail({
      leadName: name,
      leadPhone: phone,
      message: `Intent: ${intentLabel}${size ? `, Size: ${size}` : ""}${budget ? `, Budget: ${budget}` : ""}`,
      source: "Property advisor chat widget",
    }),
  });

  return { ok: true, data: { leadId: lead.id } };
}
