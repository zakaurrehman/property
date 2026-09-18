import { z } from "zod";
import { ApplicationStatus, CareerType } from "@/generated/prisma/enums";

export const careerTypeOptions = Object.values(CareerType);
export const applicationStatusOptions = Object.values(ApplicationStatus);

export const careerFormSchema = z.object({
  title: z.string().min(3, "Enter the job title").max(120),
  slug: z
    .string()
    .max(120)
    .regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only")
    .optional()
    .or(z.literal("")),
  department: z.string().min(2, "Enter the department").max(60),
  location: z.string().min(2, "Enter the location").max(120),
  type: z.enum(careerTypeOptions as [CareerType, ...CareerType[]]),
  description: z.string().min(30, "Description should be at least 30 characters"),
  isActive: z.boolean(),
});

export type CareerFormInput = z.input<typeof careerFormSchema>;

export const applicationSchema = z.object({
  careerId: z.string().min(1),
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  cvUrl: z.string().url("Paste a link to your CV (Google Drive, Dropbox, LinkedIn…)"),
  coverLetter: z.string().max(3000).optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v, "Please confirm we may contact you"),
  company: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type ApplicationInput = z.input<typeof applicationSchema>;
