import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function hrefForPage(
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/properties${qs ? `?${qs}` : ""}`;
}

export function PropertyPagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 pt-6">
      <Link
        href={hrefForPage(searchParams, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        aria-label="Previous page"
        className={cn(
          "border-line text-ink-600 hover:bg-accent hover:text-accent-foreground flex size-9 items-center justify-center rounded-md border",
          page === 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pages.map((p, i) => (
        <React.Fragment key={p}>
          {i > 0 && pages[i - 1] !== p - 1 && (
            <span className="text-ink-400 px-1">…</span>
          )}
          <Link
            href={hrefForPage(searchParams, p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "flex size-9 items-center justify-center rounded-md text-sm font-medium",
              p === page
                ? "bg-brand-900 text-white"
                : "border-line text-ink-600 hover:bg-accent hover:text-accent-foreground border",
            )}
          >
            {p}
          </Link>
        </React.Fragment>
      ))}

      <Link
        href={hrefForPage(searchParams, Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        aria-label="Next page"
        className={cn(
          "border-line text-ink-600 hover:bg-accent hover:text-accent-foreground flex size-9 items-center justify-center rounded-md border",
          page === totalPages && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
