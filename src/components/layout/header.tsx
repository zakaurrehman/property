"use client";

import * as React from "react";
import { Heart, Scale } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/store/ui-store";
import { useHasMounted } from "@/lib/hooks/use-has-mounted";
import { MegaMenu } from "./mega-menu";
import { MobileMenuSheet } from "./mobile-menu-sheet";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = React.useState(false);
  const mounted = useHasMounted();
  const storeSavedCount = useUiStore((s) => s.savedIds.length);
  const storeCompareCount = useUiStore((s) => s.compareIds.length);
  const savedCount = mounted ? storeSavedCount : 0;
  const compareCount = mounted ? storeCompareCount : 0;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-transparent transition-all duration-200",
        scrolled ? "glass border-line shadow-sm" : "bg-background/0",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-200 sm:px-6 lg:px-8",
          scrolled ? "h-16" : "h-20",
        )}
      >
        <div className="flex items-center gap-3">
          <MobileMenuSheet />
          <Logo />
        </div>

        <div className="hidden lg:flex">
          <MegaMenu />
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/compare"
            aria-label={t("compare")}
            className="hover:bg-accent hover:text-accent-foreground relative hidden items-center justify-center rounded-md p-2 sm:inline-flex"
          >
            <Scale className="size-[18px]" />
            {compareCount > 0 && (
              <span className="bg-accent-500 text-brand-900 absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
                {compareCount}
              </span>
            )}
          </Link>
          <Link
            href="/saved"
            aria-label={t("saved")}
            className="hover:bg-accent hover:text-accent-foreground relative hidden items-center justify-center rounded-md p-2 sm:inline-flex"
          >
            <Heart className="size-[18px]" />
            {savedCount > 0 && (
              <span className="bg-accent-500 text-brand-900 absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
                {savedCount}
              </span>
            )}
          </Link>

          <LocaleSwitcher />
          <ThemeToggle />
          <UserMenu />

          <Button size="sm" className="ml-1 hidden md:inline-flex" asChild>
            <Link href="/dashboard/listings/new">{t("listProperty")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
