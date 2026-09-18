import {
  Briefcase,
  Building2,
  Calculator,
  FileText,
  Hammer,
  Handshake,
  HardHat,
  HelpCircle,
  Home,
  KeyRound,
  Landmark,
  Paintbrush,
  PencilRuler,
  Ruler,
  ShieldCheck,
  Sofa,
  TrendingUp,
  Truck,
  type LucideIcon,
} from "lucide-react";

/**
 * Plain object-literal lookup for icon names stored as strings in the DB
 * (Service.icon). Use as `serviceIconMap[name] ?? FallbackIcon` directly at
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
  Home,
  Building2,
  Hammer,
  Paintbrush,
  Landmark,
  Handshake,
  ShieldCheck,
  FileText,
  Briefcase,
  Ruler,
  Truck,
};

/** For the admin service form's icon picker. */
export const serviceIconNames = Object.keys(serviceIconMap);

export { HelpCircle as FallbackIcon };
