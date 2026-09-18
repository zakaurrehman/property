import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getSitePage } from "@/features/site-page/server/queries";
import { saveSitePage } from "@/features/site-page/server/actions";
import { SitePageForm } from "@/features/site-page/components/site-page-form";
import { SITE_PAGE_SLUGS, type SitePageSlug } from "@/features/site-page/defaults";

export const metadata: Metadata = { title: "Edit Page" };

export default async function EditSitePagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireAdmin();
  if (!(SITE_PAGE_SLUGS as readonly string[]).includes(slug)) notFound();

  const page = await getSitePage(slug as SitePageSlug);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-ink-900 text-2xl font-bold">
          Edit — /{page.slug}
        </h1>
        {page.isDefault && (
          <p className="text-ink-600 mt-1 text-sm">
            Showing the built-in default text. Saving creates your own version.
          </p>
        )}
      </div>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <SitePageForm
          defaultValues={{ title: page.title, contentMdx: page.contentMdx }}
          onSubmit={saveSitePage.bind(null, slug)}
        />
      </div>
    </div>
  );
}
