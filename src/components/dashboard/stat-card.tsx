import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="border-line bg-surface flex items-center gap-4 rounded-2xl border p-5">
      <div className="bg-accent-500/15 text-accent-700 flex size-11 shrink-0 items-center justify-center rounded-xl">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-ink-500 text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <p className="text-ink-900 font-heading text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
