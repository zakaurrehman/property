import {
  Calculator,
  HardHat,
  HelpCircle,
  KeyRound,
  PencilRuler,
  Sofa,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/**
 * Plain object-literal lookup for icon names stored as strings in the DB
 * (Service.icon). Use as `serviceIconMap[name] ?? HelpCircle` directly at
 * the call site — routing the lookup through a function call instead trips
 * the `react-hooks/static-components` lint rule ("component created during
 * render"), even though the underlying value is always one of these same
 * stable references.
 */
export const serviceIconMap: Record<string, LucideIcon> = {
  HardHat,
  PencilRuler,
  Sofa,
  TrendingUp,
  KeyRound,
  Calculator,
};

export { HelpCircle as FallbackIcon };
