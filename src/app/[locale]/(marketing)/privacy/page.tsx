import type { Metadata } from "next";
import { getSitePage } from "@/features/site-page/server/queries";
import { LegalPage } from "@/features/site-page/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const page = await getSitePage("privacy");
  return <LegalPage page={page} />;
}
