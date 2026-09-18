import type { Metadata } from "next";
import { localizedAlternates, socialImage } from "@/lib/seo";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getProjectBySlug } from "@/features/project/server/queries";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.description,
    alternates: localizedAlternates(`/projects/${slug}`),
    ...socialImage(project.coverImage, project.name),
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-surface-2 relative mb-6 aspect-video overflow-hidden rounded-2xl">
        <Image
          src={project.coverImage}
          alt={project.name}
          fill
          className="object-cover"
          unoptimized
        />
        <Badge className="text-ink-900 absolute top-4 left-4 border-0 bg-white/90">
          {project.status}
        </Badge>
      </div>

      <div className="mb-2 flex items-center gap-2 text-sm">
        <MapPin className="text-accent-600 size-4" />
        <span className="text-ink-600">{project.locationText}</span>
      </div>
      <h1 className="font-heading text-ink-900 text-3xl font-bold">{project.name}</h1>
      {project.completionDate && (
        <p className="text-ink-500 mt-1 text-sm">
          Expected completion: {formatRelativeDate(project.completionDate)}
        </p>
      )}
      <p className="text-ink-700 mt-4 max-w-3xl leading-relaxed">{project.description}</p>

      {project.gallery.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {project.gallery.map((src) => (
            <div
              key={src}
              className="bg-surface-2 relative aspect-4/3 overflow-hidden rounded-xl"
            >
              <Image
                src={src}
                alt={project.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
