import { z } from "zod";

export const postFormSchema = z.object({
  title: z.string().min(5, "Title should be at least 5 characters").max(160),
  slug: z
    .string()
    .max(160)
    .regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only")
    .optional()
    .or(z.literal("")),
  excerpt: z.string().min(20, "Excerpt should be at least 20 characters").max(300),
  contentMdx: z.string().min(50, "Content should be at least 50 characters"),
  coverImage: z.string().url("Add a cover image"),
  tags: z.string().max(300).optional().or(z.literal("")),
  readingMinutes: z.coerce.number().int().min(1).max(60),
  published: z.boolean(),
});

export type PostFormInput = z.input<typeof postFormSchema>;
