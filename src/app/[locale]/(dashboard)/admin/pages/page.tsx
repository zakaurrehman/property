import type { Metadata } from "next";
import { ExternalLink, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllSitePages } from "@/features/site-page/server/queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Site Pages" };

export default async function AdminPagesPage() {
  await requireAdmin();
  const pages = await getAllSitePages();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Site Pages"
        description="The copy on /about, /privacy and /terms. Pages showing 'Default' haven't been edited yet and use the built-in text."
      />

      <div className="border-line overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.slug}>
                <TableCell className="text-ink-900 font-medium">{page.title}</TableCell>
                <TableCell className="text-ink-600 text-sm">/{page.slug}</TableCell>
                <TableCell className="text-sm">
                  {page.isDefault ? (
                    <Badge variant="secondary">Default</Badge>
                  ) : (
                    <span className="text-ink-500">
                      {formatRelativeDate(page.updatedAt!)}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild aria-label="View">
                      <Link href={`/${page.slug}`} target="_blank">
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild aria-label="Edit">
                      <Link href={`/admin/pages/${page.slug}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
