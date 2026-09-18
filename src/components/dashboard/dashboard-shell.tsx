"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Inbox,
  Home,
  TrendingUp,
  MapPin,
  Contact,
  Newspaper,
  Wrench,
  Star,
  HelpCircle,
  Briefcase,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";

// Server Components can't pass icon components (functions) as props to this
// Client Component, so layouts pass a serializable key and we resolve the
// actual icon here instead.
const iconMap = {
  dashboard: LayoutDashboard,
  building: Building2,
  users: Users,
  shield: ShieldCheck,
  inbox: Inbox,
  listings: Home,
  fileRates: TrendingUp,
  areas: MapPin,
  agents: Contact,
  posts: Newspaper,
  services: Wrench,
  reviews: Star,
  faqs: HelpCircle,
  careers: Briefcase,
  pages: FileText,
} as const;

export type DashboardIconKey = keyof typeof iconMap;

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: DashboardIconKey;
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: DashboardNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = iconMap[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-900 text-white"
                : "text-ink-600 hover:bg-surface-2 hover:text-ink-900",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  title,
  navItems,
  children,
}: {
  title: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24 flex flex-col gap-6">
          <p className="text-ink-900 font-heading px-3 text-lg font-bold">{title}</p>
          <NavLinks items={navItems} pathname={pathname} />
          <Button
            variant="ghost"
            className="text-ink-600 justify-start gap-2.5 px-3"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <p className="text-ink-900 font-heading text-lg font-bold">{title}</p>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-xs">
              <SheetHeader>
                <SheetTitle asChild>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 px-4 pb-8">
                <NavLinks
                  items={navItems}
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                />
                <Button
                  variant="ghost"
                  className="text-ink-600 justify-start gap-2.5 px-3"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="size-4" />
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {children}
      </div>
    </div>
  );
}
