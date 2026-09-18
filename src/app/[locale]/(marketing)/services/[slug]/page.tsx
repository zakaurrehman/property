import type { Metadata } from "next";
import { localizedAlternates, socialImage } from "@/lib/seo";
import Image from "next/image";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { getServiceBySlug } from "@/features/service/server/queries";
import { serviceIconMap, FallbackIcon } from "@/lib/lucide-icon";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.summary,
    alternates: localizedAlternates(`/services/${slug}`),
    ...socialImage(service.gallery[0], service.name),
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const Icon = serviceIconMap[service.icon] ?? FallbackIcon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="bg-accent-500/15 text-accent-700 flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <Icon className="size-7" />
        </span>
        <div>
          <h1 className="font-heading text-ink-900 text-3xl font-bold">{service.name}</h1>
          <p className="text-ink-600 mt-1">{service.summary}</p>
        </div>
      </div>

      {service.gallery.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-3">
          {service.gallery.map((src) => (
            <div
              key={src}
              className="bg-surface-2 relative aspect-video overflow-hidden rounded-xl"
            >
              <Image
                src={src}
                alt={service.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <Markdown>{service.descriptionMdx}</Markdown>
      </article>

      <div className="border-line bg-surface-2 mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6">
        <div>
          <p className="text-ink-900 font-medium">Ready to get started?</p>
          <p className="text-ink-600 text-sm">
            Tell us what you need — we&apos;ll get back within a day.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/contact">Get in touch</Link>
        </Button>
      </div>
    </div>
  );
}
