import { requireAdmin } from "@/lib/auth/guards";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/moderation", label: "Moderation", icon: "shield" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/leads", label: "Leads", icon: "inbox" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <DashboardShell title="Admin" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
