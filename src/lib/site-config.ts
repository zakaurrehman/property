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
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+923211199719",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+923211199719",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "dhaestatebureau@gmail.com",
  /** Office address — the street line is what schema.org gets, the full line is for display. */
  address: {
    street: "16-C Broadway, DHA Phase 8",
    city: "Lahore",
    full: "16-C Broadway, DHA Phase 8, Lahore, Pakistan",
  },
  leadership: {
    ceo: { name: "Sajid Iqbal", title: "Chief Executive Officer" },
  },
  /** Public profiles — footer icons and the organisation schema's sameAs. */
  social: {
    facebook: "https://www.facebook.com/dhaestatebureau",
    instagram: "https://www.instagram.com/dhaestatebureau/",
    youtube: "https://www.youtube.com/@dhaestatebureau",
    tiktok: "https://www.tiktok.com/@dha.estate.bureau",
  },
  /** Raster tile URL template ({z}/{x}/{y}) — swap providers via env, no code change. */
  mapTilesUrl:
    process.env.NEXT_PUBLIC_MAP_TILES_URL ||
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
} as const;
