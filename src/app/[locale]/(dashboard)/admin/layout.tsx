import { requireAdmin } from "@/lib/auth/guards";
import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/moderation", label: "Moderation", icon: "shield" },
  { href: "/admin/listings", label: "Listings", icon: "listings" },
  { href: "/admin/file-rates", label: "File Rates", icon: "fileRates" },
  { href: "/admin/areas", label: "Areas", icon: "areas" },
  { href: "/admin/agents", label: "Agents", icon: "agents" },
  { href: "/admin/posts", label: "Blog Posts", icon: "posts" },
  { href: "/admin/services", label: "Services", icon: "services" },
  { href: "/admin/projects", label: "Projects", icon: "building" },
  { href: "/admin/reviews", label: "Reviews", icon: "reviews" },
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
