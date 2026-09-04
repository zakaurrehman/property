import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-heading text-brand-900 dark:text-ink-900 flex items-center gap-2 text-lg font-bold tracking-tight",
        className,
      )}
    >
      <span className="bg-brand-900 dark:bg-accent-500 dark:text-brand-900 flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white">
        EB
      </span>
      <span className="hidden sm:inline">
        Estate <span className="text-accent-600 dark:text-accent-500">Bureau</span>
      </span>
    </Link>
  );
}
