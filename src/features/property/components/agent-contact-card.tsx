import { Mail, Phone, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { buildTelLink, buildWhatsAppLink, propertyWhatsAppMessage } from "@/lib/whatsapp";
import { PropertyEnquiryForm } from "@/features/lead/components/property-enquiry-form";
import type { PropertyDetailData } from "../server/queries";

export function AgentContactCard({ property }: { property: PropertyDetailData }) {
  const agent = property.agent;

  return (
    <div className="border-line bg-surface flex flex-col gap-4 rounded-2xl border p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage src={agent.photo} alt={agent.title} />
          <AvatarFallback>{agent.user.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <Link
            href={`/agents/${agent.slug}`}
            className="text-ink-900 hover:text-accent-600 font-medium"
          >
            {agent.user.name}
          </Link>
          <p className="text-ink-400 text-xs">{agent.title}</p>
          <p className="text-ink-600 mt-0.5 flex items-center gap-1 text-xs">
            <Star className="fill-accent-500 text-accent-500 size-3.5" />
            {Number(agent.rating).toFixed(1)} ({agent.reviewCount} reviews)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button asChild variant="outline" size="sm" className="flex-col gap-1 py-4">
          <a href={buildTelLink(agent.phone)}>
            <Phone className="size-4" />
            Call
          </a>
        </Button>
        <Button
          asChild
          size="sm"
          className="flex-col gap-1 bg-emerald-500 py-4 text-white hover:bg-emerald-500/90"
        >
          <a
            href={buildWhatsAppLink(
              agent.whatsapp,
              propertyWhatsAppMessage(property.refCode, property.title),
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-col gap-1 py-4">
          <a href={`mailto:${agent.email}`}>
            <Mail className="size-4" />
            Email
          </a>
        </Button>
      </div>

      <div className="border-line border-t pt-4">
        <p className="text-ink-900 mb-3 text-sm font-medium">Send an enquiry</p>
        <PropertyEnquiryForm propertyId={property.id} propertyTitle={property.title} />
      </div>
    </div>
  );
}
