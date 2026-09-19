import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo-mark";

interface LogoProps {
  className?: string;
  /**
   * "auto" hides the wordmark below `sm` (the header is crowded on phones);
   * "always" shows it — for menu sheets and the footer, where there's room.
   */
  wordmark?: "auto" | "always";
}

export function Logo({ className, wordmark = "auto" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Estate Bureau — home"
      className={cn("flex items-center gap-2.5", className)}
    >
      <LogoMark />
      <span
        className={cn(
          "font-heading flex-col leading-none",
          wordmark === "always" ? "flex" : "hidden sm:flex",
        )}
      >
        <span className="text-brand-900 dark:text-ink-900 text-[17px] font-extrabold tracking-tight">
          Estate Bureau
        </span>
        <span className="text-accent-600 dark:text-accent-500 mt-1 text-[9.5px] font-semibold tracking-[0.22em] uppercase">
          DHA Lahore
        </span>
      </span>
    </Link>
  );
}
