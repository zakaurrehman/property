"use client";

import { Search, Heart, MapPin, MessageCircle, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { mobileNavItems } from "./nav-data";

const icons = { Search, Heart, MapPin, MessageCircle, User };

export function MobileNav() {
  const t = useTranslations("mobileNav");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("search")}
      className="border-line bg-surface/95 fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t backdrop-blur lg:hidden"
    >
      {mobileNavItems.map((item) => {
        const Icon = icons[item.icon];
        const isActive = pathname === item.href.split("?")[0];
        const linkClassName = cn(
          "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
          isActive ? "text-accent-600" : "text-ink-400",
        );

        if (item.href.startsWith("#")) {
          return (
            <a key={item.href} href={item.href} className={linkClassName}>
              <Icon className="size-5" />
              {t(item.labelKey)}
            </a>
          );
        }

        return (
          <Link key={item.href} href={item.href} className={linkClassName}>
            <Icon className="size-5" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
