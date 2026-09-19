"use client";

import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { siteConfig } from "@/lib/site-config";
import { buildTelLink, buildWhatsAppLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function FloatingCtas() {
  const t = useTranslations("cta");

  return (
    <div
      className={cn(
        "fixed right-4 bottom-20 z-30 hidden flex-col gap-3 lg:bottom-6 lg:flex",
      )}
    >
      {/* White, not navy: these float over the navy hero, where a navy disc vanishes. */}
      <a
        href={buildTelLink(siteConfig.phone)}
        aria-label={t("call")}
        className="text-brand-900 flex size-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105"
      >
        <Phone className="size-5" />
      </a>
      {/* WhatsApp's own green (#25d366) so the button is recognisable at a glance. Icon-only,
          so the lighter brand green is acceptable here; text buttons keep the darker emerald. */}
      <a
        href={buildWhatsAppLink(
          siteConfig.whatsapp,
          "Hi, I'd like to know more about a property on Estate Bureau.",
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsapp")}
        className="flex size-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="size-6" />
      </a>
    </div>
  );
}
