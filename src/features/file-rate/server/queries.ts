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

export interface AdminFileRateRow extends FileRateRow {
  locationId: string;
  locationLabel: string;
  updatedAt: Date;
}

export async function getAllFileRates(): Promise<AdminFileRateRow[]> {
  const rates = await db.fileRate.findMany({
    orderBy: [{ phase: "asc" }, { plotType: "asc" }, { areaSqft: "asc" }],
    include: {
      location: { select: { id: true, name: true, parent: { select: { name: true } } } },
    },
  });
  return rates.map((r) => ({
    id: r.id,
    phase: r.phase,
    plotType: r.plotType,
    sizeLabel: r.sizeLabel,
    areaSqft: r.areaSqft,
    fileType: r.fileType,
    demandPkr: r.demandPkr === null ? null : Number(r.demandPkr),
    callForPrice: r.callForPrice,
    trend: r.trend,
    contactName: r.contactName,
    contactPhone: r.contactPhone,
    effectiveDate: r.effectiveDate,
    locationId: r.location.id,
    locationLabel: r.location.parent
      ? `${r.location.name}, ${r.location.parent.name}`
      : r.location.name,
    updatedAt: r.updatedAt,
  }));
}

export async function getFileRateForEdit(id: string): Promise<AdminFileRateRow | null> {
  const r = await db.fileRate.findUnique({
    where: { id },
    include: {
      location: { select: { id: true, name: true, parent: { select: { name: true } } } },
    },
  });
  if (!r) return null;
  return {
    id: r.id,
    phase: r.phase,
    plotType: r.plotType,
    sizeLabel: r.sizeLabel,
    areaSqft: r.areaSqft,
    fileType: r.fileType,
    demandPkr: r.demandPkr === null ? null : Number(r.demandPkr),
    callForPrice: r.callForPrice,
    trend: r.trend,
    contactName: r.contactName,
    contactPhone: r.contactPhone,
    effectiveDate: r.effectiveDate,
    locationId: r.location.id,
    locationLabel: r.location.parent
      ? `${r.location.name}, ${r.location.parent.name}`
      : r.location.name,
    updatedAt: r.updatedAt,
  };
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
