import "server-only";
import { db } from "@/lib/db";

export interface ServiceSummary {
  slug: string;
  name: string;
  summary: string;
  icon: string;
  gallery: string[];
}

export async function getServices(): Promise<ServiceSummary[]> {
  const services = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
  return services.map((s) => ({
    slug: s.slug,
    name: s.name,
    summary: s.summary,
    icon: s.icon,
    gallery: s.gallery,
  }));
}

export interface AdminServiceRow extends ServiceSummary {
  id: string;
  sortOrder: number;
  updatedAt: Date;
}

export async function getAllServices(): Promise<AdminServiceRow[]> {
  const services = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
  return services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    summary: s.summary,
    icon: s.icon,
    gallery: s.gallery,
    sortOrder: s.sortOrder,
    updatedAt: s.updatedAt,
  }));
}

export async function getServiceForEdit(id: string) {
  const s = await db.service.findUnique({ where: { id } });
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    summary: s.summary,
    descriptionMdx: s.descriptionMdx,
    icon: s.icon,
    gallery: s.gallery,
    sortOrder: s.sortOrder,
  };
}

export interface ServiceDetail extends ServiceSummary {
  descriptionMdx: string;
  packages: unknown;
}

export async function getServiceBySlug(slug: string): Promise<ServiceDetail | null> {
  const service = await db.service.findUnique({ where: { slug } });
  if (!service) return null;
  return {
    slug: service.slug,
    name: service.name,
    summary: service.summary,
    icon: service.icon,
    gallery: service.gallery,
    descriptionMdx: service.descriptionMdx,
    packages: service.packages,
  };
}
