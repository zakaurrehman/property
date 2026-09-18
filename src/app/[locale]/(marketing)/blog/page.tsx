import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import { getPublishedPosts } from "@/features/blog/server/queries";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeDate, formatReadingTime } from "@/lib/format";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  alternates: localizedAlternates("/blog"),
  title: "Blog",
  description: "Buying guides, price trends and market analysis for DHA Lahore.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">Blog</h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Buying guides, price trends and market analysis from the Estate Bureau research
          team.
        </p>
      </div>

      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title="No posts published yet" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="border-line bg-surface group overflow-hidden rounded-2xl border transition-shadow hover:shadow-sm"
            >
              <div className="bg-surface-2 relative aspect-video overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <p className="text-ink-500 mb-1.5 text-xs">
                  {formatRelativeDate(post.publishedAt)} ·{" "}
                  {formatReadingTime(post.readingMinutes)}
                </p>
                <p className="text-ink-900 font-heading font-semibold">{post.title}</p>
                <p className="text-ink-600 mt-1 line-clamp-2 text-sm">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
