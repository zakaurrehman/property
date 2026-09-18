import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/seo";

// Generated per request, never at build: the build has no database (CI uses a
// placeholder DATABASE_URL) and a build-time snapshot would go stale as
// listings change. Crawlers fetch this rarely; the cost is fine.
export const dynamic = "force-dynamic";

/** Public, crawlable routes that don't depend on data. */
const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly";
}[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/properties", priority: 0.9, changeFrequency: "daily" },
  { path: "/file-rates", priority: 0.9, changeFrequency: "daily" },
  { path: "/areas", priority: 0.8, changeFrequency: "weekly" },
  { path: "/agents", priority: 0.7, changeFrequency: "weekly" },
  { path: "/projects", priority: 0.7, changeFrequency: "weekly" },
  { path: "/services", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/reviews", priority: 0.5, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.5, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/valuation", priority: 0.5, changeFrequency: "monthly" },
  { path: "/tools/mortgage-calculator", priority: 0.4, changeFrequency: "monthly" },
  { path: "/tools/investment-calculator", priority: 0.4, changeFrequency: "monthly" },
  { path: "/tools/price-trends", priority: 0.6, changeFrequency: "daily" },
  { path: "/privacy", priority: 0.2, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.2, changeFrequency: "monthly" },
];

function entry(
  path: string,
  extra: {
    lastModified?: Date;
    priority?: number;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  } = {},
): MetadataRoute.Sitemap[number] {
  const ur = path === "/" ? "/ur" : `/ur${path}`;
  return {
    url: absoluteUrl(path),
    ...extra,
    alternates: { languages: { en: absoluteUrl(path), ur: absoluteUrl(ur) } },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sequential on purpose: a crawler endpoint gains nothing from a 7-way
  // parallel burst, and the local `prisma dev` Postgres falls over under one.
  const properties = await db.property.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  });
  const agents = await db.agent.findMany({ select: { slug: true, updatedAt: true } });
  const posts = await db.post.findMany({
    where: { publishedAt: { lte: new Date() } },
    select: { slug: true, updatedAt: true },
  });
  const services = await db.service.findMany({ select: { slug: true, updatedAt: true } });
  const projects = await db.project.findMany({ select: { slug: true, updatedAt: true } });
  const locations = await db.location.findMany({
    where: { type: { in: ["SOCIETY", "PHASE"] } },
    select: { slug: true, updatedAt: true, parent: { select: { slug: true } } },
  });
  const careers = await db.career.findMany({
    where: { isActive: true },
    select: { slug: true, createdAt: true },
  });

  return [
    ...STATIC_ROUTES.map((r) =>
      entry(r.path, { priority: r.priority, changeFrequency: r.changeFrequency }),
    ),
    ...properties.map((p) =>
      entry(`/properties/${p.slug}`, {
        lastModified: p.updatedAt,
        priority: 0.8,
        changeFrequency: "weekly",
      }),
    ),
    ...locations.map((l) =>
      entry(
        // Guide URLs carry the parent chain; the route only reads the last segment.
        l.parent && l.parent.slug !== "lahore"
          ? `/areas/lahore/${l.parent.slug}/${l.slug}`
          : `/areas/lahore/${l.slug}`,
        { lastModified: l.updatedAt, priority: 0.7, changeFrequency: "weekly" },
      ),
    ),
    ...agents.map((a) =>
      entry(`/agents/${a.slug}`, {
        lastModified: a.updatedAt,
        priority: 0.6,
        changeFrequency: "weekly",
      }),
    ),
    ...posts.map((p) =>
      entry(`/blog/${p.slug}`, {
        lastModified: p.updatedAt,
        priority: 0.6,
        changeFrequency: "monthly",
      }),
    ),
    ...services.map((s) =>
      entry(`/services/${s.slug}`, {
        lastModified: s.updatedAt,
        priority: 0.6,
        changeFrequency: "monthly",
      }),
    ),
    ...projects.map((p) =>
      entry(`/projects/${p.slug}`, {
        lastModified: p.updatedAt,
        priority: 0.6,
        changeFrequency: "monthly",
      }),
    ),
    ...careers.map((c) =>
      entry(`/careers/${c.slug}`, {
        lastModified: c.createdAt,
        priority: 0.4,
        changeFrequency: "weekly",
      }),
    ),
  ];
}
