"use client";

import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!session?.user) {
    return (
      <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
        <Link href="/login" aria-label={t("login")}>
          <LogIn className="size-[18px]" />
        </Link>
      </Button>
    );
  }

  const { user } = session;
  const initials = (user.name ?? user.email ?? "?").slice(0, 1).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="hover:ring-accent-500 ml-1 rounded-full transition-shadow hover:ring-2"
          aria-label={t("myAccount")}
        >
          <Avatar>
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate font-medium">{user.name}</span>
          <span className="text-ink-500 truncate text-xs font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(user.role === "AGENT" || user.role === "ADMIN") && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="size-4" />
              {t("dashboard")}
            </Link>
          </DropdownMenuItem>
        )}
        {user.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldCheck className="size-4" />
              {t("admin")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/saved">
            <UserIcon className="size-4" />
            {t("myAccount")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="size-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
