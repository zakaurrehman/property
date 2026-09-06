import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatEnumLabel } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  UNDER_OFFER: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  SOLD: "bg-ink-500/15 text-ink-600",
  RENTED: "bg-ink-500/15 text-ink-600",
  EXPIRED: "bg-ink-500/15 text-ink-500",
  REJECTED: "bg-red-500/15 text-red-700 dark:text-red-400",
  DRAFT: "bg-ink-500/10 text-ink-500",
  NEW: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  CONTACTED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  QUALIFIED: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  VIEWING: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  NEGOTIATION: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  WON: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  LOST: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={cn("border-0", STATUS_STYLES[status] ?? "bg-ink-500/10 text-ink-600")}
    >
      {formatEnumLabel(status)}
    </Badge>
  );
}
