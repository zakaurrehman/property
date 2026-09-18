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

export interface AdminProjectRow extends ProjectSummary {
  id: string;
  updatedAt: Date;
}

export async function getAllProjects(): Promise<AdminProjectRow[]> {
  const projects = await db.project.findMany({ orderBy: { updatedAt: "desc" } });
  return projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    locationText: p.locationText,
    status: p.status,
    coverImage: p.coverImage,
    updatedAt: p.updatedAt,
  }));
}

export async function getProjectForEdit(id: string) {
  const p = await db.project.findUnique({ where: { id } });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    locationText: p.locationText,
    status: p.status,
    coverImage: p.coverImage,
    gallery: p.gallery,
    completionDate: p.completionDate,
  };
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
