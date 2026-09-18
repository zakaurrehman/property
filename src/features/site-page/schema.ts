import { z } from "zod";

export const sitePageFormSchema = z.object({
  title: z.string().min(2, "Enter a title").max(120),
  contentMdx: z.string().min(20, "Content should be at least 20 characters"),
});

export type SitePageFormInput = z.input<typeof sitePageFormSchema>;
