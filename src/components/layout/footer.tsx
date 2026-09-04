import { getTranslations } from "next-intl/server";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/shared/social-icons";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site-config";
import { buildTelLink } from "@/lib/whatsapp";
import { megaMenuColumns } from "./nav-data";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

const seoLinkCloud = [
  {
    label: "5 Marla House for Sale in DHA Phase 6",
    href: "/properties?purpose=SALE&type=HOUSE&location=dha-phase-6",
  },
  {
    label: "1 Kanal Plot for Sale in DHA Phase 7",
    href: "/properties?purpose=SALE&type=PLOT&location=dha-phase-7",
  },
  {
    label: "10 Marla House for Rent in DHA Phase 5",
    href: "/properties?purpose=RENT&type=HOUSE&location=dha-phase-5",
  },
  {
    label: "Plot Files in DHA Phase 9 Prism",
    href: "/properties?purpose=SALE&type=PLOT_FILE&location=dha-phase-9-prism",
  },
  {
    label: "Commercial Plots in DHA Phase 8",
    href: "/properties?category=COMMERCIAL&location=dha-phase-8",
  },
  {
    label: "Farmhouses in DHA Lahore",
    href: "/properties?type=FARMHOUSE&location=dha-lahore",
  },
  {
    label: "Upper Portion for Rent in DHA Phase 4",
    href: "/properties?purpose=RENT&type=UPPER_PORTION&location=dha-phase-4",
  },
  { label: "DHA Phase 6 File Rates", href: "/file-rates?phase=6" },
];

const socials = [
  { icon: FacebookIcon, href: "https://facebook.com", label: "Facebook" },
  { icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
  { icon: LinkedinIcon, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: YoutubeIcon, href: "https://youtube.com", label: "YouTube" },
];

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  return (
    <footer className="border-line bg-surface-2 mt-24 border-t pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr_1.2fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-ink-600 max-w-xs text-sm">
              Estate Bureau is Lahore&apos;s premium DHA property portal — verified
              listings, real file rates, agents who answer.
            </p>
            <dl className="text-ink-600 space-y-1 text-sm">
              <div>
                <dt className="text-ink-900 inline font-medium">{t("office")}: </dt>
                <dd className="inline">
                  123 Main Boulevard, DHA Phase 5, Lahore, Pakistan
                </dd>
              </div>
              <div>
                <dt className="text-ink-900 inline font-medium">{t("hours")}: </dt>
                <dd className="inline">{t("hoursValue")}</dd>
              </div>
              <div>
                <dt className="text-ink-900 inline font-medium">{t("phone")}: </dt>
                <dd className="inline">
                  <a
                    href={buildTelLink(siteConfig.phone)}
                    className="hover:text-accent-600"
                  >
                    {siteConfig.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-ink-900 inline font-medium">{t("email")}: </dt>
                <dd className="inline">
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="hover:text-accent-600"
                  >
                    {siteConfig.email}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="flex gap-3 pt-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="border-line text-ink-600 hover:border-accent-500 hover:text-accent-600 flex size-9 items-center justify-center rounded-full border"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {megaMenuColumns.map((column) => (
              <div key={column.titleKey}>
                <p className="text-ink-400 mb-3 text-xs font-semibold tracking-wide uppercase">
                  {tNav(column.titleKey)}
                </p>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-ink-600 hover:text-accent-600 text-sm"
                      >
                        {tNav(link.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-ink-900 text-sm font-semibold">{t("newsletter")}</p>
            <p className="text-ink-600 text-sm">{t("newsletterCopy")}</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-line mt-12 border-t pt-8">
          <p className="text-ink-400 mb-3 text-xs font-semibold tracking-wide uppercase">
            {t("popularSearches")}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {seoLinkCloud.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-400 hover:text-accent-600 text-xs"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-line text-ink-400 mt-8 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. {t("rights")}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-accent-600">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-accent-600">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
