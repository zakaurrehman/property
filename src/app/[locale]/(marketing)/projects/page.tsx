import type { Metadata } from "next";
import Image from "next/image";
import { Building } from "lucide-react";
import { getProjects } from "@/features/project/server/queries";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Master-planned developments across DHA Lahore — from balloting to handover.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          Projects
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Master-planned developments we&apos;re building or selling across DHA Lahore.
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={Building} title="No projects listed right now" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="border-line bg-surface group overflow-hidden rounded-2xl border transition-shadow hover:shadow-sm"
            >
              <div className="bg-surface-2 relative aspect-4/3 overflow-hidden">
                <Image
                  src={project.coverImage}
                  alt={project.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
                <Badge className="text-ink-900 absolute top-3 left-3 border-0 bg-white/90">
                  {project.status}
                </Badge>
              </div>
              <div className="p-4">
                <p className="text-ink-900 font-heading font-semibold">{project.name}</p>
                <p className="text-ink-500 text-sm">{project.locationText}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
