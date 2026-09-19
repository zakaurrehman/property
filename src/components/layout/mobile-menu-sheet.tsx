"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { megaMenuColumns } from "./nav-data";
import { Logo } from "./logo";

export function MobileMenuSheet() {
  const t = useTranslations("nav");
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={t("openMenu")}
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs overflow-y-auto">
        <SheetHeader>
          <SheetTitle asChild>
            <Logo wordmark="always" />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-6 px-4 pb-8">
          {megaMenuColumns.map((column) => (
            <div key={column.titleKey}>
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                {t(column.titleKey)}
              </p>
              <ul className="flex flex-col gap-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="hover:bg-accent hover:text-accent-foreground block rounded-md px-2 py-1.5 text-sm"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
