import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatEnumLabel } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import type { AgentListItem } from "../server/queries";

export function AgentCard({ agent }: { agent: AgentListItem }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="border-line bg-surface flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition-shadow hover:shadow-sm"
    >
      <div className="relative size-20 overflow-hidden rounded-full">
        <Image
          src={agent.photo}
          alt={agent.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div>
        <p className="text-ink-900 font-heading font-semibold">{agent.name}</p>
        <p className="text-ink-500 text-sm">{agent.title}</p>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <Star className="size-4 fill-amber-400 text-amber-400" />
        <span className="text-ink-700 font-medium">{agent.rating.toFixed(1)}</span>
        <span className="text-ink-500">({agent.reviewCount})</span>
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {agent.specialisations.slice(0, 2).map((s) => (
          <Badge key={s} variant="secondary" className="text-[11px]">
            {formatEnumLabel(s)}
          </Badge>
        ))}
      </div>
      <p className="text-ink-500 text-xs">
        {agent.activeListingCount} active listing
        {agent.activeListingCount === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
