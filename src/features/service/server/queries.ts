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
