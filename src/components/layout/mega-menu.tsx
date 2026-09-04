"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { megaMenuColumns } from "./nav-data";

export function MegaMenu() {
  const t = useTranslations("nav");

  return (
    <NavigationMenu viewport={false} className="max-w-none">
      <NavigationMenuList>
        {megaMenuColumns.map((column) => (
          <NavigationMenuItem key={column.titleKey}>
            <NavigationMenuTrigger className="bg-transparent text-sm font-medium">
              {t(column.titleKey)}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[220px] gap-1 p-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link href={link.href}>{t(link.labelKey)}</Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
