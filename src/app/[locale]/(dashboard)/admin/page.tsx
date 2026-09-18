import type { Metadata } from "next";
import { Building2, ShieldAlert, Users, UserCog, Inbox } from "lucide-react";
import { getAdminStats } from "@/features/admin/server/queries";
import { StatCard } from "@/components/dashboard/stat-card";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-ink-900 text-2xl font-bold">Admin overview</h1>
        <p className="text-ink-600 mt-1 text-sm">Platform-wide activity at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total listings" value={stats.totalListings} icon={Building2} />
        <StatCard
          label="Pending review"
          value={stats.pendingListings}
          icon={ShieldAlert}
        />
        <StatCard label="Registered users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Agents" value={stats.totalAgents} icon={UserCog} />
      </div>

      {stats.pendingListings > 0 && (
        <div className="border-line bg-surface flex items-center justify-between rounded-2xl border p-5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-6 shrink-0 text-amber-500" />
            <p className="text-ink-700 text-sm">
              <strong>{stats.pendingListings}</strong> listing
              {stats.pendingListings === 1 ? "" : "s"} waiting for review.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/moderation">Review now</Link>
          </Button>
        </div>
      )}

      <div className="border-line bg-surface flex items-center gap-3 rounded-2xl border p-5">
        <Inbox className="text-accent-600 size-6 shrink-0" />
        <p className="text-ink-700 text-sm">
          <strong>{stats.newLeadsToday}</strong> new lead
          {stats.newLeadsToday === 1 ? "" : "s"} today.
        </p>
      </div>

      <div>
        <p className="text-ink-900 mb-3 font-semibold">Manage site content</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {contentLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-line bg-surface hover:border-accent-500/50 rounded-2xl border p-4 transition-colors hover:shadow-sm"
            >
              <p className="text-ink-900 font-medium">{link.label}</p>
              <p className="text-ink-500 mt-0.5 text-xs">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const contentLinks = [
  {
    href: "/admin/listings",
    label: "Listings",
    description: "Every property, status and flags",
  },
  {
    href: "/admin/file-rates",
    label: "File rates",
    description: "DHA plot file demand rates",
  },
  { href: "/admin/areas", label: "Areas", description: "Societies, phases and guides" },
  { href: "/admin/agents", label: "Agents", description: "Public agent profiles" },
  {
    href: "/admin/posts",
    label: "Blog posts",
    description: "Guides and market analysis",
  },
  {
    href: "/admin/services",
    label: "Services",
    description: "Construction, design, valuation…",
  },
  {
    href: "/admin/projects",
    label: "Projects",
    description: "Developments on /projects",
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    description: "Testimonials and agent ratings",
  },
  { href: "/admin/faqs", label: "FAQs", description: "Questions on /faq" },
  { href: "/admin/careers", label: "Careers", description: "Job posts and applications" },
  {
    href: "/admin/pages",
    label: "Site pages",
    description: "About, privacy, terms copy",
  },
];
