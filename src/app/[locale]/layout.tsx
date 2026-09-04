import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Plus_Jakarta_Sans, Noto_Nastaliq_Urdu } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, localeDirections, type Locale } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { FloatingCtas } from "@/components/layout/floating-ctas";
import { CommandPalette } from "@/components/layout/command-palette";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/lib/site-config";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-nastaliq",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} — ${t("heroTitle")}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: t("heroSubtitle"),
    alternates: {
      languages: { en: "/en", ur: "/ur" },
    },
    openGraph: {
      siteName: siteConfig.name,
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#070b14" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const dir = localeDirections[locale as Locale];

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${plusJakarta.variable} ${nastaliq.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <NuqsAdapter>
            <ThemeProvider>
              <QueryProvider>
                <TooltipProvider>
                  <a
                    href="#main-content"
                    className="focus:bg-brand-900 sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-white"
                  >
                    Skip to content
                  </a>
                  <Header />
                  <main id="main-content" className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <MobileNav />
                  <FloatingCtas />
                  <CommandPalette />
                  <Toaster />
                </TooltipProvider>
              </QueryProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
