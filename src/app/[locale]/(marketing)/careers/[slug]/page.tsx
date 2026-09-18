import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { Briefcase, MapPin } from "lucide-react";
import { getCareerBySlug } from "@/features/career/server/queries";
import { ApplicationForm } from "@/features/career/components/application-form";
import { Badge } from "@/components/ui/badge";
import { formatEnumLabel } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getCareerBySlug(slug);
  if (!job) return {};
  return { title: `${job.title} — Careers`, description: job.description.slice(0, 160) };
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getCareerBySlug(slug);
  // Closed roles keep their URL but aren't listed or applicable.
  if (!job || !job.isActive) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <article>
          <div className="text-ink-500 mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1">
              <Briefcase className="size-3.5" />
              {job.department}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {job.location}
            </span>
            <Badge variant="secondary">{formatEnumLabel(job.type)}</Badge>
          </div>
          <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
            {job.title}
          </h1>
          <div className="prose prose-neutral dark:prose-invert mt-6 max-w-none">
            <Markdown>{job.description}</Markdown>
          </div>
        </article>

        <aside className="border-line bg-surface h-fit rounded-2xl border p-6 lg:sticky lg:top-24">
          <h2 className="font-heading text-ink-900 mb-1 text-lg font-bold">
            Apply for this role
          </h2>
          <p className="text-ink-600 mb-4 text-sm">
            We reply to every application within a week.
          </p>
          <ApplicationForm careerId={job.id} jobTitle={job.title} />
        </aside>
      </div>
    </div>
  );
}
