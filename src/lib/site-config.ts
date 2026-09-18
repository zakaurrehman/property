/**
 * Client-safe public config. Deliberately separate from lib/env.ts (which
 * also validates server-only secrets) so client components never pull that
 * bundle in.
 *
 * `||` rather than `??`: NEXT_PUBLIC_* values are inlined at build time, and a
 * variable saved with a blank value on the host becomes "" — which `??` would
 * happily keep, leaving the footer with an empty email and wa.me links with
 * no number.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Estate Bureau",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923000000000",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+924235000000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@estatebureau.pk",
  /** Raster tile URL template ({z}/{x}/{y}) — swap providers via env, no code change. */
  mapTilesUrl:
    process.env.NEXT_PUBLIC_MAP_TILES_URL ||
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
} as const;
