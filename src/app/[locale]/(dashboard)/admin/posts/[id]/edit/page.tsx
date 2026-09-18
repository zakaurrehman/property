import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getPostForEdit } from "@/features/blog/server/queries";
import { PostForm } from "@/features/blog/components/post-form";
import { updatePost } from "@/features/blog/server/actions";

export const metadata: Metadata = { title: "Edit Post" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();

  const post = await getPostForEdit(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">Edit post</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <PostForm
          mode="edit"
          defaultValues={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            contentMdx: post.contentMdx,
            coverImage: post.coverImage,
            tags: post.tags.join(", "),
            readingMinutes: post.readingMinutes,
            published: post.published,
          }}
          onSubmit={updatePost.bind(null, id)}
        />
      </div>
    </div>
  );
}
