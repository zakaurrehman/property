import type { Metadata } from "next";
import Markdown from "react-markdown";
import { Building2, MapPin, Star, Users } from "lucide-react";
import { getAboutStats, getSitePage } from "@/features/site-page/server/queries";
import { getAgents } from "@/features/agent/server/queries";
import { AgentCard } from "@/features/agent/components/agent-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Estate Bureau — verified DHA Lahore listings, real file rates, and consultants who answer.",
};

export default async function AboutPage() {
  const [page, stats, agents] = await Promise.all([
    getSitePage("about"),
    getAboutStats(),
    getAgents(),
  ]);

  const statCards = [
    { icon: Building2, value: stats.activeListings, label: "Live listings" },
    { icon: MapPin, value: stats.phasesCovered, label: "DHA phases covered" },
    { icon: Users, value: stats.agents, label: "Consultants" },
    {
      icon: Star,
      value: stats.averageRating === null ? "—" : stats.averageRating.toFixed(1),
      label: `Average rating (${stats.approvedReviews} reviews)`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          {page.title}
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Verified listings, real file rates, and consultants who answer — for DHA Lahore
          and beyond.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="border-line bg-surface rounded-2xl border p-5 text-center"
          >
            <Icon className="text-accent-600 mx-auto mb-2 size-5" />
            <p className="font-heading text-ink-900 text-3xl font-bold">{value}</p>
            <p className="text-ink-500 mt-1 text-xs">{label}</p>
          </div>
        ))}
      </div>

      <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl">
        <Markdown>{page.contentMdx}</Markdown>
      </article>

      {agents.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-ink-900 text-2xl font-bold">
                Meet the team
              </h2>
              <p className="text-ink-600 mt-1 text-sm">
                Every listing and file rate on this site is looked after by one of them.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/agents">All consultants</Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {agents.slice(0, 4).map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      <section className="border-line bg-surface-2 mt-16 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6">
        <div>
          <p className="text-ink-900 font-medium">
            Have a question about a phase or a file?
          </p>
          <p className="text-ink-600 text-sm">
            Ask a consultant — we reply on WhatsApp within the hour.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/contact">Get in touch</Link>
        </Button>
      </section>
    </div>
  );
}
