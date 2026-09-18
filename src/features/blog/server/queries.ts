import "server-only";
import { db } from "@/lib/db";

export interface BlogPostSummary {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  readingMinutes: number;
  publishedAt: Date;
  authorName: string;
}

export async function getPublishedPosts(): Promise<BlogPostSummary[]> {
  const posts = await db.post.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    tags: p.tags,
    readingMinutes: p.readingMinutes,
    publishedAt: p.publishedAt!,
    authorName: p.author.name,
  }));
}

export interface BlogPostDetail extends BlogPostSummary {
  contentMdx: string;
}

export async function getPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const post = await db.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!post || !post.publishedAt) return null;

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    tags: post.tags,
    readingMinutes: post.readingMinutes,
    publishedAt: post.publishedAt,
    authorName: post.author.name,
    contentMdx: post.contentMdx,
  };
}

export interface AdminPostRow {
  id: string;
  slug: string;
  title: string;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string;
}

/** Every post, drafts included, for the admin table. */
export async function getAllPosts(): Promise<AdminPostRow[]> {
  const posts = await db.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true } } },
  });
  return posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    publishedAt: p.publishedAt,
    updatedAt: p.updatedAt,
    authorName: p.author.name,
  }));
}

export interface PostEditData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentMdx: string;
  coverImage: string;
  tags: string[];
  readingMinutes: number;
  published: boolean;
}

export async function getPostForEdit(id: string): Promise<PostEditData | null> {
  const p = await db.post.findUnique({ where: { id } });
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    contentMdx: p.contentMdx,
    coverImage: p.coverImage,
    tags: p.tags,
    readingMinutes: p.readingMinutes,
    published: p.publishedAt !== null,
  };
}

export async function getRelatedPosts(slug: string, tags: string[], limit = 3) {
  return db.post
    .findMany({
      where: {
        slug: { not: slug },
        publishedAt: { lte: new Date() },
        tags: { hasSome: tags },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: { slug: true, title: true, coverImage: true, publishedAt: true },
    })
    .then((posts) => posts.map((p) => ({ ...p, publishedAt: p.publishedAt! })));
}
