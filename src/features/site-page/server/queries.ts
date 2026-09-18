import "server-only";
import { db } from "@/lib/db";
import { SITE_PAGE_SLUGS, sitePageDefaults, type SitePageSlug } from "../defaults";

export interface SitePageData {
  slug: SitePageSlug;
  title: string;
  contentMdx: string;
  updatedAt: Date | null;
  /** True when no DB row exists yet and the built-in default copy is being shown. */
  isDefault: boolean;
}

/** Falls back to the built-in copy so the fixed routes always render. */
export async function getSitePage(slug: SitePageSlug): Promise<SitePageData> {
  const row = await db.sitePage.findUnique({ where: { slug } });
  if (row) {
    return {
      slug,
      title: row.title,
      contentMdx: row.contentMdx,
      updatedAt: row.updatedAt,
      isDefault: false,
    };
  }
  return { slug, ...sitePageDefaults[slug], updatedAt: null, isDefault: true };
}

export async function getAllSitePages(): Promise<SitePageData[]> {
  return Promise.all(SITE_PAGE_SLUGS.map((slug) => getSitePage(slug)));
}

export interface AboutStats {
  activeListings: number;
  agents: number;
  phasesCovered: number;
  approvedReviews: number;
  averageRating: number | null;
}

export async function getAboutStats(): Promise<AboutStats> {
  const [activeListings, agents, phasesCovered, reviews] = await Promise.all([
    db.property.count({ where: { status: "ACTIVE" } }),
    db.agent.count(),
    db.location.count({ where: { type: "PHASE" } }),
    db.review.aggregate({
      where: { isApproved: true },
      _count: true,
      _avg: { rating: true },
    }),
  ]);
  return {
    activeListings,
    agents,
    phasesCovered,
    approvedReviews: reviews._count,
    averageRating:
      reviews._avg.rating === null ? null : Math.round(reviews._avg.rating * 10) / 10,
  };
}
