import { z } from "zod";

export const propertyEnquirySchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  consent: z
    .boolean()
    .refine((v) => v, "Please accept to be contacted about this enquiry"),
});

export type PropertyEnquiryInput = z.infer<typeof propertyEnquirySchema>;

const honeypotField = z.string().max(0, "Spam detected").optional().or(z.literal(""));

export const contactFormSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().min(5, "Tell us a little about your enquiry").max(2000),
  department: z.enum(["SALES", "RENTALS", "CONSTRUCTION", "GENERAL"]),
  consent: z.boolean().refine((v) => v, "Please accept to be contacted"),
  company: honeypotField,
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const valuationRequestSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  propertyType: z.enum([
    "HOUSE",
    "FLAT",
    "UPPER_PORTION",
    "LOWER_PORTION",
    "PLOT",
    "PLOT_FILE",
    "COMMERCIAL_PLOT",
    "SHOP",
    "OFFICE",
    "BUILDING",
    "WAREHOUSE",
    "FARMHOUSE",
    "PENTHOUSE",
  ]),
  locationText: z.string().min(2, "Tell us the location"),
  sizeMarla: z.coerce.number().positive().optional(),
  message: z.string().max(1000).optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v, "Please accept to be contacted"),
  company: honeypotField,
});

// z.input (pre-coercion) rather than z.infer (post-coercion) so the form's
// sizeMarla stays a plain string field — react-hook-form + zodResolver need
// the two sides to agree on that, since <input type="number"> always hands
// back a string and zod's coercion only happens at validate/submit time.
export type ValuationRequestInput = z.input<typeof valuationRequestSchema>;

export const chatLeadSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().min(7, "Enter a valid phone number"),
  purpose: z.enum(["SALE", "RENT"]).optional(),
  intent: z.enum(["BUY", "RENT", "PLOT_FILE", "CONSTRUCTION"]),
  size: z.string().optional(),
  budget: z.string().optional(),
});

export type ChatLeadInput = z.infer<typeof chatLeadSchema>;
