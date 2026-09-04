"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
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
      <a
        href={buildTelLink(siteConfig.phone)}
        aria-label={t("call")}
        className="bg-brand-900 flex size-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
      >
        <Phone className="size-5" />
      </a>
      <a
        href={buildWhatsAppLink(
          siteConfig.whatsapp,
          "Hi, I'd like to know more about a property on Estate Bureau.",
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsapp")}
        className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="size-5" />
      </a>
    </div>
  );
}
