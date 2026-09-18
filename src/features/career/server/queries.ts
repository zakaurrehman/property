import "server-only";
import { db } from "@/lib/db";

export interface CareerSummary {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  createdAt: Date;
}

export async function getActiveCareers(): Promise<CareerSummary[]> {
  const careers = await db.career.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return careers.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    department: c.department,
    location: c.location,
    type: c.type,
    createdAt: c.createdAt,
  }));
}

export interface CareerDetail extends CareerSummary {
  description: string;
  isActive: boolean;
}

export async function getCareerBySlug(slug: string): Promise<CareerDetail | null> {
  const c = await db.career.findUnique({ where: { slug } });
  if (!c) return null;
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    department: c.department,
    location: c.location,
    type: c.type,
    description: c.description,
    isActive: c.isActive,
    createdAt: c.createdAt,
  };
}

export interface AdminCareerRow extends CareerSummary {
  isActive: boolean;
  applicationCount: number;
}

export async function getAllCareers(): Promise<AdminCareerRow[]> {
  const careers = await db.career.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
  return careers.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    department: c.department,
    location: c.location,
    type: c.type,
    isActive: c.isActive,
    applicationCount: c._count.applications,
    createdAt: c.createdAt,
  }));
}

export async function getCareerForEdit(id: string) {
  const c = await db.career.findUnique({ where: { id } });
  if (!c) return null;
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    department: c.department,
    location: c.location,
    type: c.type,
    description: c.description,
    isActive: c.isActive,
  };
}

export interface AdminApplicationRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  cvUrl: string;
  coverLetter: string | null;
  status: string;
  careerTitle: string;
  createdAt: Date;
}

export async function getAllApplications(): Promise<AdminApplicationRow[]> {
  const apps = await db.careerApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { career: { select: { title: true } } },
  });
  return apps.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    cvUrl: a.cvUrl,
    coverLetter: a.coverLetter,
    status: a.status,
    careerTitle: a.career.title,
    createdAt: a.createdAt,
  }));
}
