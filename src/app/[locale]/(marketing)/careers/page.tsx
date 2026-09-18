import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import { ArrowRight, Briefcase, MapPin } from "lucide-react";
import { getActiveCareers } from "@/features/career/server/queries";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatEnumLabel, formatRelativeDate } from "@/lib/format";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  alternates: localizedAlternates("/careers"),
  title: "Careers",
  description:
    "Open roles at Estate Bureau — sales, marketing, construction and operations in Lahore.",
};

export default async function CareersPage() {
  const careers = await getActiveCareers();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          Careers
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Join a team that knows DHA Lahore street by street. Current openings below.
        </p>
      </div>

      {careers.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No open positions right now"
          description="Send your CV to the email on our Contact page and we'll keep it on file."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {careers.map((job) => (
            <Link
              key={job.id}
              href={`/careers/${job.slug}`}
              className="border-line bg-surface hover:border-accent-500/50 group flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="text-ink-900 font-heading text-lg font-semibold">
                  {job.title}
                </p>
                <div className="text-ink-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span>{job.department}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {job.location}
                  </span>
                  <Badge variant="secondary">{formatEnumLabel(job.type)}</Badge>
                  <span>Posted {formatRelativeDate(job.createdAt)}</span>
                </div>
              </div>
              <ArrowRight className="text-accent-600 size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
