import { z } from "zod";
import { ReviewSource } from "@/generated/prisma/enums";

export const reviewSourceOptions = Object.values(ReviewSource);

export const reviewFormSchema = z.object({
  authorName: z.string().min(2, "Enter the reviewer's name").max(80),
  authorImage: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().min(10, "Review should be at least 10 characters").max(2000),
  source: z.enum(reviewSourceOptions as [ReviewSource, ...ReviewSource[]]),
  agentId: z.string().optional().or(z.literal("")),
  isApproved: z.boolean(),
});

export type ReviewFormInput = z.input<typeof reviewFormSchema>;

/** Public "leave a review" form — always lands unapproved for admin moderation. */
export const publicReviewSchema = z.object({
  authorName: z.string().min(2, "Enter your name").max(80),
  rating: z.coerce.number().int().min(1, "Pick a rating").max(5),
  body: z.string().min(20, "Tell us a little more (at least 20 characters)").max(2000),
  agentId: z.string().optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v, "Please confirm we may publish your review"),
  company: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type PublicReviewInput = z.input<typeof publicReviewSchema>;
