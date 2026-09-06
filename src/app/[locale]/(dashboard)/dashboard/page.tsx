import type { Metadata } from "next";
import { Building2, Eye, Inbox, TrendingUp } from "lucide-react";
import { requireAgent } from "@/lib/auth/guards";
import { getAgentDashboardStats } from "@/features/property/server/dashboard-queries";
import { StatCard } from "@/components/dashboard/stat-card";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Agent Dashboard" };

export default async function DashboardOverviewPage() {
  const { user, agent } = await requireAgent();
  const stats = agent
    ? await getAgentDashboardStats(agent.id)
    : { activeListings: 0, pendingListings: 0, totalViews: 0, newLeads: 0 };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-ink-900 text-2xl font-bold">
            Welcome back, {user.name}
          </h1>
          <p className="text-ink-600 mt-1 text-sm">
            Here&apos;s how your listings are performing.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">List a property</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active listings" value={stats.activeListings} icon={Building2} />
        <StatCard
          label="Pending review"
          value={stats.pendingListings}
          icon={TrendingUp}
        />
        <StatCard
          label="Total views"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
        />
        <StatCard label="New leads" value={stats.newLeads} icon={Inbox} />
      </div>

      {!agent && (
        <p className="border-line bg-surface-2 text-ink-600 rounded-xl border p-4 text-sm">
          You&apos;re signed in as an admin without an agent profile — listings you create
          will be attached to another agent automatically.
        </p>
      )}
    </div>
  );
}
