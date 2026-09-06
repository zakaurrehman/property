import "server-only";
import { db } from "@/lib/db";

export interface ProjectSummary {
  slug: string;
  name: string;
  description: string;
  locationText: string;
  status: string;
  coverImage: string;
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const projects = await db.project.findMany({ orderBy: { createdAt: "desc" } });
  return projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    locationText: p.locationText,
    status: p.status,
    coverImage: p.coverImage,
  }));
}

export interface ProjectDetail extends ProjectSummary {
  gallery: string[];
  completionDate: Date | null;
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const project = await db.project.findUnique({ where: { slug } });
  if (!project) return null;
  return {
    slug: project.slug,
    name: project.name,
    description: project.description,
    locationText: project.locationText,
    status: project.status,
    coverImage: project.coverImage,
    gallery: project.gallery,
    completionDate: project.completionDate,
  };
}
