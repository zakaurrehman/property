import type { Metadata } from "next";
import { Heart, LayoutDashboard, Scale, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import {
  ChangePasswordForm,
  ProfileForm,
} from "@/features/auth/components/profile-forms";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatEnumLabel, formatRelativeDate } from "@/lib/format";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = { title: "My Account" };

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await db.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
      passwordHash: true,
    },
  });

  const quickLinks = [
    { href: "/saved", label: "Saved properties", icon: Heart },
    { href: "/compare", label: "Compare", icon: Scale },
    ...(user.role === "AGENT" || user.role === "ADMIN"
      ? [{ href: "/dashboard", label: "Agent dashboard", icon: LayoutDashboard }]
      : []),
    ...(user.role === "ADMIN"
      ? [{ href: "/admin", label: "Admin panel", icon: ShieldCheck }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <Avatar size="lg">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-ink-900 text-2xl font-bold">{user.name}</h1>
          <p className="text-ink-500 text-sm">
            {user.email} · <Badge variant="secondary">{formatEnumLabel(user.role)}</Badge>{" "}
            · member since {formatRelativeDate(user.createdAt)}
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {quickLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="border-line bg-surface hover:border-accent-500/50 flex items-center gap-3 rounded-2xl border p-4 transition-colors hover:shadow-sm"
          >
            <Icon className="text-accent-600 size-5" />
            <span className="text-ink-900 font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <section className="border-line bg-surface mb-6 rounded-2xl border p-6">
        <h2 className="font-heading text-ink-900 mb-4 text-lg font-bold">Profile</h2>
        <ProfileForm defaultValues={{ name: user.name, phone: user.phone ?? "" }} />
      </section>

      {user.passwordHash && (
        <section className="border-line bg-surface rounded-2xl border p-6">
          <h2 className="font-heading text-ink-900 mb-4 text-lg font-bold">Password</h2>
          <ChangePasswordForm />
        </section>
      )}
    </div>
  );
}
