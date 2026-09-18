import { z } from "zod";
import { LocationType } from "@/generated/prisma/enums";

export const locationTypeOptions = Object.values(LocationType);

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().optional(),
);
const optionalUrl = z.string().url("Enter a valid URL").optional().or(z.literal(""));

export const locationFormSchema = z.object({
  name: z.string().min(2, "Enter the area name").max(80),
  nameUr: z.string().max(80).optional().or(z.literal("")),
  slug: z
    .string()
    .max(80)
    .regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only")
    .optional()
    .or(z.literal("")),
  type: z.enum(locationTypeOptions as [LocationType, ...LocationType[]]),
  parentId: z.string().optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  heroImage: optionalUrl,
  mapImageUrl: optionalUrl,
  avgPricePerMarla: optionalNumber,
  lat: optionalNumber,
  lng: optionalNumber,
  popularityRank: optionalNumber,
});

export type LocationFormInput = z.input<typeof locationFormSchema>;
