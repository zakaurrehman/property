import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-line bg-surface-2 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <span className="bg-surface text-ink-400 flex size-12 items-center justify-center rounded-full">
        <Icon className="size-6" />
      </span>
      <p className="text-ink-900 text-base font-semibold">{title}</p>
      {description && <p className="text-ink-600 max-w-sm text-sm">{description}</p>}
      {action}
    </div>
  );
}
