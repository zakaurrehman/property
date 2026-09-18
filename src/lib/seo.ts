import type { Metadata } from "next";
import { siteConfig } from "./site-config";

/**
 * Public origin for canonical/hreflang/sitemap/JSON-LD URLs. Server-side
 * only: prefers NEXT_PUBLIC_SITE_URL, then Vercel's own production domain
 * (so a deploy with that variable left blank still emits real URLs rather
 * than localhost), then the dev default. Client code should keep using
 * siteConfig.url — the Vercel variable isn't exposed to the browser bundle.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return siteConfig.url;
}

/** Absolute URL on the public origin. */
export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}

/**
 * hreflang + canonical for a public path. Locale prefixing is "as-needed", so
 * English is the bare path and Urdu is /ur + path; x-default points at English.
 */
export function localizedAlternates(path: string): NonNullable<Metadata["alternates"]> {
  const en = path === "/" ? "/" : path;
  const ur = path === "/" ? "/ur" : `/ur${path}`;
  return {
    canonical: en,
    languages: { en, ur, "x-default": en },
  };
}

/** Open Graph + Twitter card block for a page with a cover image. */
export function socialImage(
  imageUrl: string | null | undefined,
  alt: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  if (!imageUrl) return {};
  return {
    openGraph: { images: [{ url: imageUrl, alt }] },
    twitter: { card: "summary_large_image", images: [imageUrl] },
  };
}
