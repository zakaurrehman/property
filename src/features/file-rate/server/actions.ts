"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import type { ActionResult } from "@/types/action-result";
import type { FileRateTrend } from "@/generated/prisma/enums";
import { fileRateFormSchema, sizePresets, type FileRateFormInput } from "../schema";

function revalidateFileRates() {
  revalidatePath("/file-rates");
  revalidatePath("/admin/file-rates");
}

/** Trend is derived from the previous demand unless the admin overrides it. */
function computeTrend(
  previous: bigint | null | undefined,
  next: bigint | null,
  override?: FileRateTrend,
): FileRateTrend {
  if (override) return override;
  if (previous === null || previous === undefined || next === null) return "FLAT";
  if (next > previous) return "UP";
  if (next < previous) return "DOWN";
  return "FLAT";
}

async function resolvePhaseName(locationId: string): Promise<string | null> {
  const location = await db.location.findUnique({
    where: { id: locationId },
    select: { name: true },
  });
  return location?.name ?? null;
}

export async function createFileRate(
  input: FileRateFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = fileRateFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;

  const phase = await resolvePhaseName(v.locationId);
  if (!phase) return { ok: false, error: "That location no longer exists." };

  const demandPkr =
    v.callForPrice || v.demandPkr === undefined ? null : BigInt(Math.round(v.demandPkr));
  const effectiveDate = v.effectiveDate ? new Date(v.effectiveDate) : new Date();
  const areaSqft = sizePresets.find((p) => p.label === v.sizeLabel)?.sqft ?? 0;

  const rate = await db.fileRate.create({
    data: {
      city: "Lahore",
      locationId: v.locationId,
      phase,
      plotType: v.plotType,
      sizeLabel: v.sizeLabel,
      areaSqft,
      fileType: v.fileType,
      demandPkr,
      callForPrice: v.callForPrice,
      trend: computeTrend(undefined, demandPkr, v.trend),
      contactName: v.contactName,
      contactPhone: v.contactPhone,
      effectiveDate,
      history: { create: { demandPkr, effectiveDate } },
    },
  });

  revalidateFileRates();
  return { ok: true, data: { id: rate.id } };
}

export async function updateFileRate(
  id: string,
  input: FileRateFormInput,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = fileRateFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;

  const existing = await db.fileRate.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "File rate not found." };

  const phase = await resolvePhaseName(v.locationId);
  if (!phase) return { ok: false, error: "That location no longer exists." };

  const demandPkr =
    v.callForPrice || v.demandPkr === undefined ? null : BigInt(Math.round(v.demandPkr));
  const effectiveDate = v.effectiveDate ? new Date(v.effectiveDate) : new Date();
  const areaSqft =
    sizePresets.find((p) => p.label === v.sizeLabel)?.sqft ?? existing.areaSqft;
  const demandChanged = demandPkr !== existing.demandPkr;

  await db.fileRate.update({
    where: { id },
    data: {
      locationId: v.locationId,
      phase,
      plotType: v.plotType,
      sizeLabel: v.sizeLabel,
      areaSqft,
      fileType: v.fileType,
      demandPkr,
      callForPrice: v.callForPrice,
      trend: computeTrend(existing.demandPkr, demandPkr, v.trend),
      contactName: v.contactName,
      contactPhone: v.contactPhone,
      effectiveDate,
      // Only a real price movement earns a history point — editing the
      // contact or size shouldn't fake a data point on the trend chart.
      ...(demandChanged ? { history: { create: { demandPkr, effectiveDate } } } : {}),
    },
  });

  revalidateFileRates();
  return { ok: true, data: { id } };
}

export async function deleteFileRate(id: string): Promise<ActionResult<null>> {
  await requireAdmin();
  await db.fileRate.delete({ where: { id } });
  revalidateFileRates();
  return { ok: true, data: null };
}
