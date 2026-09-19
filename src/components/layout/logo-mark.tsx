import { cn } from "@/lib/utils";

/**
 * The Estate Bureau mark: a gold roofline over an "E" on a navy tile.
 *
 * Kept as inline SVG (rather than an <img>) so the tile can lift to a
 * lighter navy with a hairline border in dark mode — a flat navy square
 * disappears against the dark header. The same geometry is baked into
 * `app/icon.svg` and the PNG icons under `public/`; change them together.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={cn("size-9 shrink-0", className)}
    >
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="15"
        className="fill-brand-900 stroke-transparent stroke-2 dark:fill-[#16305a] dark:stroke-white/15"
      />
      {/* roofline */}
      <path
        d="M16 28 L32 14 L48 28"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-accent-500"
      />
      {/* E */}
      <path
        d="M21 31 V50 M21 31 H43 M21 40.5 H37 M21 50 H43"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-white"
      />
    </svg>
  );
}
