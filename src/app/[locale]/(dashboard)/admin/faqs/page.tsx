import type { Metadata } from "next";
import { HelpCircle, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllFaqs } from "@/features/faq/server/queries";
import { deleteFaq } from "@/features/faq/server/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "FAQs" };

export default async function AdminFaqsPage() {
  await requireAdmin();
  const faqs = await getAllFaqs();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="FAQs"
        description="Shown on /faq, grouped by category in this order."
        action={{ href: "/admin/faqs/new", label: "Add FAQ" }}
      />

      {faqs.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No FAQs yet" />
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="text-ink-500 text-sm">{faq.sortOrder}</TableCell>
                  <TableCell className="text-ink-900 max-w-md truncate font-medium">
                    {faq.question}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{faq.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {faq.isPublished ? (
                      <Badge className="border-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Hidden</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link href={`/admin/faqs/${faq.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton id={faq.id} action={deleteFaq} label="this FAQ" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
