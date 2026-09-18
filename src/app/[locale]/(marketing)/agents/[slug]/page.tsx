import type { Metadata } from "next";
import { localizedAlternates, socialImage } from "@/lib/seo";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { getAgentBySlug } from "@/features/agent/server/queries";
import { PropertyGrid } from "@/features/property/components/property-grid";
import { Badge } from "@/components/ui/badge";
import { formatEnumLabel } from "@/lib/format";
import { formatRelativeDate } from "@/lib/format";
import { buildTelLink, buildWhatsAppLink } from "@/lib/whatsapp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) return {};
  return {
    title: agent.name,
    description: agent.bio,
    alternates: localizedAlternates(`/agents/${slug}`),
    ...socialImage(agent.photo, agent.name),
  };
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="border-line bg-surface rounded-2xl border p-6 text-center">
            <div className="relative mx-auto size-24 overflow-hidden rounded-full">
              <Image
                src={agent.photo}
                alt={agent.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="text-ink-900 font-heading mt-3 text-lg font-semibold">
              {agent.name}
            </p>
            <p className="text-ink-500 text-sm">{agent.title}</p>
            <div className="mt-2 flex items-center justify-center gap-1 text-sm">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="text-ink-700 font-medium">{agent.rating.toFixed(1)}</span>
              <span className="text-ink-500">({agent.reviewCount} reviews)</span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <a
                href={buildWhatsAppLink(
                  agent.whatsapp,
                  `Hi ${agent.name}, I found you on Estate Bureau.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
              <a
                href={buildTelLink(agent.phone)}
                className="border-line hover:bg-surface-2 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
              >
                <Phone className="size-4" />
                {agent.phone}
              </a>
              <a
                href={`mailto:${agent.email}`}
                className="text-ink-600 hover:bg-surface-2 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm"
              >
                <Mail className="size-4" />
                {agent.email}
              </a>
            </div>
          </div>

          <div className="border-line bg-surface rounded-2xl border p-6">
            <p className="text-ink-900 mb-2 text-sm font-semibold">Specialisations</p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {agent.specialisations.map((s) => (
                <Badge key={s} variant="secondary">
                  {formatEnumLabel(s)}
                </Badge>
              ))}
            </div>
            <p className="text-ink-900 mb-2 text-sm font-semibold">Languages</p>
            <p className="text-ink-600 mb-4 text-sm">{agent.languages.join(", ")}</p>
            <p className="text-ink-900 mb-2 text-sm font-semibold">Areas served</p>
            <ul className="text-ink-600 flex flex-col gap-1 text-sm">
              {agent.areasServed.map((area, i) => (
                <li key={`${area}-${i}`} className="flex items-center gap-1.5">
                  <MapPin className="text-accent-600 size-3.5 shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex flex-col gap-10">
          <div>
            <h1 className="font-heading text-ink-900 mb-2 text-2xl font-bold">
              About {agent.name}
            </h1>
            <p className="text-ink-700 leading-relaxed">{agent.bio}</p>
            <p className="text-ink-500 mt-2 text-sm">
              {agent.yearsExperience} years of experience
            </p>
          </div>

          <div>
            <h2 className="font-heading text-ink-900 mb-4 text-xl font-bold">
              Active Listings ({agent.listings.length})
            </h2>
            <PropertyGrid items={agent.listings} />
          </div>

          {agent.reviews.length > 0 && (
            <div>
              <h2 className="font-heading text-ink-900 mb-4 text-xl font-bold">
                Reviews
              </h2>
              <div className="flex flex-col gap-4">
                {agent.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-line bg-surface rounded-2xl border p-5"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-ink-900 font-medium">{review.authorName}</p>
                      <span className="text-ink-500 text-xs">
                        {formatRelativeDate(review.createdAt)}
                      </span>
                    </div>
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-ink-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-ink-700 text-sm">{review.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
