import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z.string().min(2, "Enter the service name").max(80),
  slug: z
    .string()
    .max(80)
    .regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only")
    .optional()
    .or(z.literal("")),
  summary: z.string().min(10, "Summary should be at least 10 characters").max(200),
  descriptionMdx: z.string().min(30, "Description should be at least 30 characters"),
  icon: z.string().min(1, "Pick an icon"),
  gallery: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })),
  sortOrder: z.coerce.number().int().min(0).max(999),
});

export type ServiceFormInput = z.input<typeof serviceFormSchema>;
