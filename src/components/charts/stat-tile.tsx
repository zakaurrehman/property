import { cn } from "@/lib/utils";

/** Sentence-case label + proportional-figure value; `hero` for the one number a page leads with. */
export function StatTile({
  label,
  value,
  hint,
  hero = false,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  hero?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("border-line bg-surface rounded-2xl border p-5", className)}>
      <p className="text-ink-500 text-xs">{label}</p>
      <p
        className={cn(
          "font-heading text-ink-900 mt-1 font-bold",
          hero ? "text-4xl sm:text-5xl" : "text-2xl",
        )}
      >
        {value}
      </p>
      {hint && <p className="text-ink-500 mt-1 text-xs">{hint}</p>}
    </div>
  );
}
