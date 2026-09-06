import { z } from "zod";
import {
  PropertyType,
  PropertyCategory,
  Purpose,
  Furnishing,
  Facing,
  Possession,
  FileType,
  RentPeriod,
} from "@/generated/prisma/enums";

const purposeEnum = z.enum(Object.values(Purpose) as [Purpose, ...Purpose[]]);
const typeEnum = z.enum(Object.values(PropertyType) as [PropertyType, ...PropertyType[]]);
const categoryEnum = z.enum(
  Object.values(PropertyCategory) as [PropertyCategory, ...PropertyCategory[]],
);
const furnishingEnum = z.enum(Object.values(Furnishing) as [Furnishing, ...Furnishing[]]);
const facingEnum = z.enum(Object.values(Facing) as [Facing, ...Facing[]]);
const possessionEnum = z.enum(Object.values(Possession) as [Possession, ...Possession[]]);
const fileTypeEnum = z.enum(Object.values(FileType) as [FileType, ...FileType[]]);
const rentPeriodEnum = z.enum(Object.values(RentPeriod) as [RentPeriod, ...RentPeriod[]]);

export const purposeOptions = Object.values(Purpose);
export const typeOptions = Object.values(PropertyType);
export const categoryOptions = Object.values(PropertyCategory);
export const furnishingOptions = Object.values(Furnishing);
export const facingOptions = Object.values(Facing);
export const possessionOptions = Object.values(Possession);
export const fileTypeOptions = Object.values(FileType);
export const rentPeriodOptions = Object.values(RentPeriod);
export const sizeUnitOptions = ["MARLA", "KANAL", "SQFT", "SQYD"] as const;

const optionalText = (max: number) => z.string().max(max).optional().or(z.literal(""));
const optionalUrl = () =>
  z.string().url("Enter a valid URL").optional().or(z.literal(""));
const optionalYear = z.coerce
  .number()
  .int()
  .min(1950)
  .max(new Date().getFullYear() + 2)
  .optional();
const optionalCount = z.coerce.number().int().nonnegative().max(50).optional();

export const listingImageSchema = z.object({
  url: z.string().url("Enter a valid image URL"),
  alt: z.string().optional(),
});

export const propertyFormSchema = z
  .object({
    title: z.string().min(10, "Title should be at least 10 characters").max(150),
    description: z
      .string()
      .min(30, "Description should be at least 30 characters")
      .max(4000),
    purpose: purposeEnum,
    type: typeEnum,
    category: categoryEnum,
    price: z.coerce.number().positive("Enter a valid price"),
    priceOnRequest: z.boolean().default(false),
    rentPeriod: rentPeriodEnum.optional(),
    sizeValue: z.coerce.number().positive("Enter the plot/covered size"),
    sizeUnit: z.enum(sizeUnitOptions).default("MARLA"),
    bedrooms: optionalCount,
    bathrooms: optionalCount,
    floors: optionalCount,
    parking: optionalCount,
    yearBuilt: optionalYear,
    furnishing: furnishingEnum.optional(),
    facing: facingEnum.optional(),
    plotNo: optionalText(20),
    streetNo: optionalText(20),
    possession: possessionEnum.default("READY"),
    fileType: fileTypeEnum.optional(),
    locationId: z.string().min(1, "Select a location"),
    locationLabel: z.string().optional(),
    address: z.string().min(5, "Enter the street address"),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    amenities: z.array(z.string()).default([]),
    videoUrl: optionalUrl(),
    images: z.array(listingImageSchema).min(1, "Add at least one photo").max(20),
  })
  .refine((data) => data.purpose !== "RENT" || !!data.rentPeriod, {
    message: "Select a rent period",
    path: ["rentPeriod"],
  });

// z.input (pre-coercion) so number fields stay plain strings for react-hook-form,
// matching the sizeMarla pattern in features/lead/schema.ts.
export type PropertyFormInput = z.input<typeof propertyFormSchema>;
export type PropertyFormOutput = z.infer<typeof propertyFormSchema>;
