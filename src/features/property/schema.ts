import { z } from "zod";
import {
  PropertyType,
  PropertyCategory,
  Purpose,
  Furnishing,
  FileType,
} from "@/generated/prisma/enums";
import { toSqft, type AreaUnit } from "@/lib/units";

const purposeEnum = z.enum(Object.values(Purpose) as [Purpose, ...Purpose[]]);
const typeEnum = z.enum(Object.values(PropertyType) as [PropertyType, ...PropertyType[]]);
const categoryEnum = z.enum(
  Object.values(PropertyCategory) as [PropertyCategory, ...PropertyCategory[]],
);
const furnishingEnum = z.enum(Object.values(Furnishing) as [Furnishing, ...Furnishing[]]);
const fileTypeEnum = z.enum(Object.values(FileType) as [FileType, ...FileType[]]);

export const sortOptions = [
  "newest",
  "price-asc",
  "price-desc",
  "area-asc",
  "area-desc",
  "popular",
] as const;

const commaList = () =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : v.split(",")).filter(Boolean));

/** Parses raw `?...` search params (all strings) into a typed filter set. */
export const propertySearchParamsSchema = z.object({
  purpose: purposeEnum.optional(),
  type: commaList().pipe(z.array(typeEnum)).optional(),
  category: categoryEnum.optional(),
  location: z.string().optional(),
  q: z.string().optional(),
  ref: z.string().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  areaMin: z.coerce.number().nonnegative().optional(),
  areaMax: z.coerce.number().nonnegative().optional(),
  areaUnit: z.enum(["MARLA", "KANAL", "SQFT", "SQYD"]).default("MARLA"),
  beds: z.coerce.number().int().nonnegative().optional(),
  baths: z.coerce.number().int().nonnegative().optional(),
  furnishing: furnishingEnum.optional(),
  fileType: fileTypeEnum.optional(),
  verifiedOnly: z
    .union([z.string(), z.boolean()])
    .transform((v) => v === true || v === "true")
    .optional(),
  sort: z.enum(sortOptions).default("newest"),
  page: z.coerce.number().int().positive().default(1),
});

export type PropertySearchParams = z.infer<typeof propertySearchParamsSchema>;

export function parsePropertySearchParams(
  raw: Record<string, string | string[] | undefined>,
): PropertySearchParams {
  return propertySearchParamsSchema.parse(raw);
}

/** Converts areaMin/areaMax (in the filter's chosen unit) to sqft for querying. */
export function areaFilterToSqft(params: PropertySearchParams) {
  const unit = params.areaUnit as AreaUnit;
  return {
    min: params.areaMin !== undefined ? toSqft(params.areaMin, unit) : undefined,
    max: params.areaMax !== undefined ? toSqft(params.areaMax, unit) : undefined,
  };
}
