import { z } from "zod";

export const projectStatusOptions = [
  "Selling",
  "Under Construction",
  "Balloted",
  "Completed",
] as const;

export const projectFormSchema = z.object({
  name: z.string().min(2, "Enter the project name").max(120),
  slug: z
    .string()
    .max(120)
    .regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .min(30, "Description should be at least 30 characters")
    .max(4000),
  locationText: z.string().min(2, "Where is the project?").max(120),
  status: z.enum(projectStatusOptions),
  coverImage: z.string().url("Add a cover image"),
  gallery: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })),
  completionDate: z.string().optional().or(z.literal("")),
});

export type ProjectFormInput = z.input<typeof projectFormSchema>;
