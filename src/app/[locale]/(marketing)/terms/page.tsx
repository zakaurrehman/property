import type { Metadata } from "next";
import { getSitePage } from "@/features/site-page/server/queries";
import { LegalPage } from "@/features/site-page/components/legal-page";

export const metadata: Metadata = { title: "Terms of Use" };

export default async function TermsPage() {
  const page = await getSitePage("terms");
  return <LegalPage page={page} />;
}
