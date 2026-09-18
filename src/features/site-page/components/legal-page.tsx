import Markdown from "react-markdown";
import { formatRelativeDate } from "@/lib/format";
import type { SitePageData } from "../server/queries";

/** Shared layout for the Markdown-only pages (privacy, terms). */
export function LegalPage({ page }: { page: SitePageData }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-ink-900 mb-2 text-3xl font-bold sm:text-4xl">
        {page.title}
      </h1>
      {page.updatedAt && (
        <p className="text-ink-500 mb-8 text-sm">
          Updated {formatRelativeDate(page.updatedAt)}
        </p>
      )}
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <Markdown>{page.contentMdx}</Markdown>
      </article>
    </div>
  );
}
