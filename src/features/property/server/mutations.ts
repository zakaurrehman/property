"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/auth/guards";
import { slugify } from "@/lib/slugify";
import { toSqft } from "@/lib/units";
import type { ActionResult } from "@/types/action-result";
import { propertyFormSchema, type PropertyFormInput } from "../listing-schema";

async function generateRefCode(): Promise<string> {
  const count = await db.property.count();
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `EB-${count + 1 + attempt}`;
    const exists = await db.property.findUnique({
      where: { refCode: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  return `EB-${Date.now()}`;
}

function toPropertyData(input: ReturnType<typeof propertyFormSchema.parse>) {
  return {
    title: input.title,
    description: input.description,
    purpose: input.purpose,
    type: input.type,
    category: input.category,
    price: BigInt(Math.round(input.price)),
    priceOnRequest: input.priceOnRequest,
    rentPeriod: input.purpose === "RENT" ? input.rentPeriod : undefined,
    areaSqft: Math.round(toSqft(input.sizeValue, input.sizeUnit)),
    areaUnitDisplay: input.sizeUnit,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    floors: input.floors,
    parking: input.parking,
    yearBuilt: input.yearBuilt,
    furnishing: input.furnishing,
    facing: input.facing,
    plotNo: input.plotNo || undefined,
    streetNo: input.streetNo || undefined,
    possession: input.possession,
    fileType: input.fileType,
    locationId: input.locationId,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
    amenities: input.amenities,
    videoUrl: input.videoUrl || undefined,
  };
}

export async function createProperty(
  input: PropertyFormInput,
): Promise<ActionResult<{ slug: string }>> {
  const { user, agent } = await requireAgent();

  const parsed = propertyFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Admins may not have an Agent profile of their own — fall back to the
  // first agent record so admin-created listings still have an owner.
  const agentId = agent?.id ?? (await db.agent.findFirst({ select: { id: true } }))?.id;
  if (!agentId) {
    return { ok: false, error: "No agent profile exists to attach this listing to." };
  }

  const refCode = await generateRefCode();
  const slug = `${slugify(parsed.data.title)}-${refCode.toLowerCase()}`;

  const property = await db.property.create({
    data: {
      ...toPropertyData(parsed.data),
      refCode,
      slug,
      agentId,
      status: user.role === "ADMIN" ? "ACTIVE" : "PENDING",
      publishedAt: user.role === "ADMIN" ? new Date() : undefined,
      media: {
        create: parsed.data.images.map((img, i) => ({
          url: img.url,
          alt: img.alt || parsed.data.title,
          sortOrder: i,
          isCover: i === 0,
        })),
      },
    },
  });

  revalidatePath("/dashboard/listings");
  return { ok: true, data: { slug: property.slug } };
}

export async function updateProperty(
  propertyId: string,
  input: PropertyFormInput,
): Promise<ActionResult<{ slug: string }>> {
  const { user, agent } = await requireAgent();

  const existing = await db.property.findUnique({
    where: { id: propertyId },
    select: { agentId: true },
  });
  if (!existing) return { ok: false, error: "Listing not found." };
  if (user.role !== "ADMIN" && existing.agentId !== agent?.id) {
    return { ok: false, error: "You don't have permission to edit this listing." };
  }

  const parsed = propertyFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const property = await db.property.update({
    where: { id: propertyId },
    data: {
      ...toPropertyData(parsed.data),
      media: {
        deleteMany: {},
        create: parsed.data.images.map((img, i) => ({
          url: img.url,
          alt: img.alt || parsed.data.title,
          sortOrder: i,
          isCover: i === 0,
        })),
      },
    },
  });

  revalidatePath("/dashboard/listings");
  revalidatePath("/admin/listings");
  revalidatePath(`/properties/${property.slug}`);
  return { ok: true, data: { slug: property.slug } };
}

export async function deleteProperty(propertyId: string): Promise<ActionResult<null>> {
  const { user, agent } = await requireAgent();

  const existing = await db.property.findUnique({
    where: { id: propertyId },
    select: { agentId: true },
  });
  if (!existing) return { ok: false, error: "Listing not found." };
  if (user.role !== "ADMIN" && existing.agentId !== agent?.id) {
    return { ok: false, error: "You don't have permission to delete this listing." };
  }

  await db.property.delete({ where: { id: propertyId } });
  revalidatePath("/dashboard/listings");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/moderation");
  revalidatePath("/properties");
  return { ok: true, data: null };
}
