"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const t = useTranslations("footer");
  const [status, setStatus] = React.useState<"idle" | "submitted">("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Wired to Resend + a Subscriber table in Phase 5 (Leads/email phase).
    setStatus("submitted");
  }

  if (status === "submitted") {
    return <p className="text-sm text-emerald-500">{t("newsletterThanks")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
      <Input
        type="email"
        required
        placeholder={t("newsletterPlaceholder")}
        aria-label={t("newsletter")}
        className="bg-surface"
      />
      <Button type="submit" variant="secondary">
        {t("newsletterSubmit")}
      </Button>
    </form>
  );
}
