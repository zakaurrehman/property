import { z } from "zod";
import { Specialisation } from "@/generated/prisma/enums";

export const specialisationOptions = Object.values(Specialisation);

export const agentFormSchema = z.object({
  title: z.string().min(2, "Enter a job title").max(80),
  bio: z.string().min(20, "Bio should be at least 20 characters").max(2000),
  photo: z.string().url("Add a profile photo"),
  phone: z.string().min(7, "Enter a valid phone number"),
  whatsapp: z.string().min(7, "Enter a valid WhatsApp number"),
  email: z.string().email("Enter a valid email"),
  specialisations: z.array(
    z.enum(specialisationOptions as [Specialisation, ...Specialisation[]]),
  ),
  languages: z.string().max(200).optional().or(z.literal("")),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  areasServed: z.string().max(500).optional().or(z.literal("")),
  isFeatured: z.boolean(),
});

export type AgentFormInput = z.input<typeof agentFormSchema>;
