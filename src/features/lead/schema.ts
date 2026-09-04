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
