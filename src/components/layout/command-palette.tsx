"use client";

import * as React from "react";
import { Building2, Calculator, FileText, Map, Search, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const navigateItems = [
  { icon: Search, labelKey: "buy" as const, href: "/properties?purpose=SALE" },
  { icon: Building2, labelKey: "rent" as const, href: "/properties?purpose=RENT" },
  { icon: Users, labelKey: "companyTeam" as const, href: "/agents" },
  { icon: FileText, labelKey: "companyBlog" as const, href: "/blog" },
];

const toolItems = [
  { icon: FileText, labelKey: "toolFileRates" as const, href: "/file-rates" },
  { icon: Map, labelKey: "toolMaps" as const, href: "/maps" },
  {
    icon: Calculator,
    labelKey: "toolMortgageCalc" as const,
    href: "/tools/mortgage-calculator",
  },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("nav");
  const tp = useTranslations("commandPalette");
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title={tp("placeholder")}>
      <CommandInput placeholder={tp("placeholder")} />
      <CommandList>
        <CommandEmpty>{tp("empty")}</CommandEmpty>
        <CommandGroup heading={tp("groupNavigate")}>
          {navigateItems.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              <item.icon />
              {t(item.labelKey)}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading={tp("groupTools")}>
          {toolItems.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              <item.icon />
              {t(item.labelKey)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
