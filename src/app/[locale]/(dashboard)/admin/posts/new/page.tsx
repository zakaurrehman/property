import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { PostForm } from "@/features/blog/components/post-form";
import { createPost } from "@/features/blog/server/actions";

export const metadata: Metadata = { title: "New Post" };

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">New post</h1>
      <div className="border-line bg-surface rounded-2xl border p-6 sm:p-8">
        <PostForm mode="create" onSubmit={createPost} />
      </div>
    </div>
  );
}
