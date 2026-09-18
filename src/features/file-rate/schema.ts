import { z } from "zod";
import { FileType, FileRateTrend } from "@/generated/prisma/enums";

export const fileTypeOptions = Object.values(FileType);
export const trendOptions = Object.values(FileRateTrend);
export const plotTypeOptions = ["Residential", "Commercial", "Farmhouse"] as const;

/** Common DHA plot sizes → sqft, so admins pick a size instead of typing sqft. */
export const sizePresets = [
  { label: "3 Marla", sqft: 675 },
  { label: "5 Marla", sqft: 1125 },
  { label: "7 Marla", sqft: 1575 },
  { label: "8 Marla", sqft: 1800 },
  { label: "10 Marla", sqft: 2250 },
  { label: "12 Marla", sqft: 2700 },
  { label: "14 Marla", sqft: 3150 },
  { label: "1 Kanal", sqft: 4500 },
  { label: "2 Kanal", sqft: 9000 },
  { label: "4 Kanal", sqft: 18000 },
  { label: "4 Marla Commercial", sqft: 900 },
  { label: "8 Marla Commercial", sqft: 1800 },
] as const;

// "" from an empty <input type="number"> must mean "not set", not 0 —
// `z.coerce.number()` alone would turn "" into 0 and pass validation.
const optionalMoney = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().positive("Enter a valid amount").optional(),
);

export const fileRateFormSchema = z
  .object({
    locationId: z.string().min(1, "Pick a phase or society"),
    locationLabel: z.string().optional(),
    plotType: z.string().min(1, "Pick a plot type"),
    sizeLabel: z.string().min(1, "Pick a size"),
    fileType: z.enum(fileTypeOptions as [FileType, ...FileType[]]),
    demandPkr: optionalMoney,
    callForPrice: z.boolean(),
    trend: z.enum(trendOptions as [FileRateTrend, ...FileRateTrend[]]).optional(),
    contactName: z.string().min(2, "Enter the contact's name"),
    contactPhone: z.string().min(7, "Enter a valid phone number"),
    effectiveDate: z.string().optional().or(z.literal("")),
  })
  .refine((v) => v.callForPrice || v.demandPkr !== undefined, {
    message: "Enter a demand price or tick 'Call for price'",
    path: ["demandPkr"],
  });

export type FileRateFormInput = z.input<typeof fileRateFormSchema>;
export type FileRateFormValues = z.output<typeof fileRateFormSchema>;
