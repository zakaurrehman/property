import {
  ArrowDownToLine,
  ArrowUpDown,
  Box,
  Camera,
  Dumbbell,
  Flame,
  Flower2,
  GraduationCap,
  Home,
  Landmark,
  ShieldCheck,
  SquareCode,
  Sun,
  Trees,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Matches the `icon` field on seeded Amenity rows. Falls back to a generic dot. */
export const amenityIcons: Record<string, LucideIcon> = {
  Waves,
  Dumbbell,
  ShieldCheck,
  Trees,
  Landmark,
  GraduationCap,
  SquareCode,
  Home,
  Box,
  Flower2,
  ArrowDownToLine,
  Sun,
  Zap,
  ArrowUpDown,
  Camera,
  Flame,
};

export function getAmenityIcon(name: string): LucideIcon {
  return amenityIcons[name] ?? ShieldCheck;
}
