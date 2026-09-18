import { z } from "zod";

export const faqFormSchema = z.object({
  question: z.string().min(5, "Enter the question").max(200),
  answer: z.string().min(10, "Enter the answer").max(3000),
  category: z.string().min(2, "Enter a category").max(60),
  sortOrder: z.coerce.number().int().min(0).max(999),
  isPublished: z.boolean(),
});

export type FaqFormInput = z.input<typeof faqFormSchema>;
