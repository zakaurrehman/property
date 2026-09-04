import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ur"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ur: "اردو",
};

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ur: "rtl",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});
