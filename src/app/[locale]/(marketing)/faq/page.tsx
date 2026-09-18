import type { Metadata } from "next";
import Markdown from "react-markdown";
import { HelpCircle } from "lucide-react";
import { getPublishedFaqs } from "@/features/faq/server/queries";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about buying, selling and renting in DHA Lahore — plot files, file rates, overseas buying and our fees.",
};

export default async function FaqPage() {
  const groups = await getPublishedFaqs();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-ink-900 text-3xl font-bold sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="text-ink-600 mx-auto mt-3 max-w-xl">
          Plot files, file rates, buying from abroad, fees — the questions we get asked
          most.
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No questions published yet" />
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <section key={group.category}>
              <h2 className="font-heading text-ink-900 mb-3 text-lg font-bold">
                {group.category}
              </h2>
              <Accordion type="multiple" className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border-line bg-surface rounded-xl border px-4"
                  >
                    <AccordionTrigger className="py-3 text-left hover:no-underline">
                      <span className="text-ink-900 font-medium">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none">
                        <Markdown>{item.answer}</Markdown>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      )}

      <div className="border-line bg-surface-2 mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-6">
        <div>
          <p className="text-ink-900 font-medium">Didn&apos;t find your answer?</p>
          <p className="text-ink-600 text-sm">
            Send us a message — a consultant will reply the same day.
          </p>
        </div>
        <Button asChild>
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
