import type { Metadata } from "next";
import { ExternalLink, Newspaper, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllPosts } from "@/features/blog/server/queries";
import { deletePost } from "@/features/blog/server/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { EmptyState } from "@/components/shared/empty-state";
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

export const metadata: Metadata = { title: "Blog Posts" };

export default async function AdminPostsPage() {
  await requireAdmin();
  const posts = await getAllPosts();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Blog Posts"
        description="Drafts are only visible here; published posts appear on /blog."
        action={{ href: "/admin/posts/new", label: "New post" }}
      />

      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title="No posts yet" />
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="text-ink-900 max-w-md truncate font-medium">
                    {post.title}
                  </TableCell>
                  <TableCell>
                    {post.publishedAt ? (
                      <Badge className="border-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-ink-600 text-sm">
                    {post.authorName}
                  </TableCell>
                  <TableCell className="text-ink-500 text-sm">
                    {formatRelativeDate(post.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {post.publishedAt && (
                        <Button variant="ghost" size="icon" asChild aria-label="View">
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <ExternalLink className="size-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton id={post.id} action={deletePost} label={post.title} />
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
