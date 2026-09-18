import "server-only";
import { db } from "@/lib/db";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface FaqGroup {
  category: string;
  items: FaqItem[];
}

/** Published FAQs grouped by category, in admin-defined order. */
export async function getPublishedFaqs(): Promise<FaqGroup[]> {
  const faqs = await db.faq.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const groups = new Map<string, FaqGroup>();
  for (const f of faqs) {
    if (!groups.has(f.category))
      groups.set(f.category, { category: f.category, items: [] });
    groups.get(f.category)!.items.push({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
    });
  }
  return Array.from(groups.values());
}

export interface AdminFaqRow extends FaqItem {
  sortOrder: number;
  isPublished: boolean;
  updatedAt: Date;
}

export async function getAllFaqs(): Promise<AdminFaqRow[]> {
  const faqs = await db.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return faqs.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category,
    sortOrder: f.sortOrder,
    isPublished: f.isPublished,
    updatedAt: f.updatedAt,
  }));
}

export async function getFaqForEdit(id: string) {
  const f = await db.faq.findUnique({ where: { id } });
  if (!f) return null;
  return {
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category,
    sortOrder: f.sortOrder,
    isPublished: f.isPublished,
  };
}
