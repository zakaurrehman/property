import "server-only";
import { db } from "@/lib/db";

export interface FileRateRow {
  id: string;
  phase: string;
  plotType: string;
  sizeLabel: string;
  areaSqft: number;
  fileType: string;
  demandPkr: number | null;
  callForPrice: boolean;
  trend: string;
  contactName: string;
  contactPhone: string;
  effectiveDate: Date;
}

export interface FileRatePhaseGroup {
  phase: string;
  locationSlug: string | null;
  rows: FileRateRow[];
}

export async function getFileRates(city = "Lahore"): Promise<FileRatePhaseGroup[]> {
  const rates = await db.fileRate.findMany({
    where: { city },
    orderBy: [{ phase: "asc" }, { sizeLabel: "asc" }],
    include: { location: { select: { slug: true } } },
  });

  const groups = new Map<string, FileRatePhaseGroup>();
  for (const rate of rates) {
    if (!groups.has(rate.phase)) {
      groups.set(rate.phase, {
        phase: rate.phase,
        locationSlug: rate.location.slug,
        rows: [],
      });
    }
    groups.get(rate.phase)!.rows.push({
      id: rate.id,
      phase: rate.phase,
      plotType: rate.plotType,
      sizeLabel: rate.sizeLabel,
      areaSqft: rate.areaSqft,
      fileType: rate.fileType,
      demandPkr: rate.demandPkr === null ? null : Number(rate.demandPkr),
      callForPrice: rate.callForPrice,
      trend: rate.trend,
      contactName: rate.contactName,
      contactPhone: rate.contactPhone,
      effectiveDate: rate.effectiveDate,
    });
  }

  return Array.from(groups.values());
}

export interface FileRateHistoryPoint {
  demandPkr: number | null;
  effectiveDate: Date;
}

export async function getFileRateHistory(
  fileRateId: string,
): Promise<FileRateHistoryPoint[]> {
  const history = await db.fileRateHistory.findMany({
    where: { fileRateId },
    orderBy: { effectiveDate: "asc" },
  });
  return history.map((h) => ({
    demandPkr: h.demandPkr === null ? null : Number(h.demandPkr),
    effectiveDate: h.effectiveDate,
  }));
}
