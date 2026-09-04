/**
 * Client-safe public config. Deliberately separate from lib/env.ts (which
 * also validates server-only secrets) so client components never pull that
 * bundle in.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Estate Bureau",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+923000000000",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+924235000000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@estatebureau.pk",
} as const;
