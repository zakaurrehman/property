import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import {
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from "@/features/blog/server/queries";
import { formatRelativeDate, formatReadingTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, post.tags);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
        {post.title}
      </h1>
      <p className="text-ink-500 mt-3 text-sm">
        By {post.authorName} · {formatRelativeDate(post.publishedAt)} ·{" "}
        {formatReadingTime(post.readingMinutes)}
      </p>

      <div className="bg-surface-2 relative mt-6 aspect-video overflow-hidden rounded-2xl">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <article className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
        <Markdown>{post.contentMdx}</Markdown>
      </article>

      {related.length > 0 && (
        <div className="border-line mt-12 border-t pt-8">
          <p className="text-ink-900 mb-4 font-semibold">Related reading</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="border-line bg-surface rounded-xl border p-3 text-sm font-medium hover:shadow-sm"
              >
                {r.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
