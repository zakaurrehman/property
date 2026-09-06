import { requireAgent } from "@/lib/auth/guards";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/dashboard/listings", label: "My Listings", icon: "building" },
  { href: "/dashboard/leads", label: "Leads", icon: "users" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAgent();

  return (
    <DashboardShell title="Agent Dashboard" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
