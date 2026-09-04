/**
 * Client-safe display catalog for amenity slugs stored on Property.amenities[].
 * Mirrors the Amenity rows seeded in prisma/seed.ts — kept as a plain lookup
 * here (rather than a DB join) so property cards/detail pages can render
 * labels and icons without an extra query.
 */
export const amenityCatalog: Record<string, { label: string; icon: string }> = {
  "swimming-pool": { label: "Swimming Pool", icon: "Waves" },
  gym: { label: "Gym", icon: "Dumbbell" },
  "24-7-security": { label: "24/7 Security", icon: "ShieldCheck" },
  "park-facing": { label: "Park Facing", icon: "Trees" },
  "mosque-nearby": { label: "Mosque Nearby", icon: "Landmark" },
  "school-nearby": { label: "School Nearby", icon: "GraduationCap" },
  "corner-plot": { label: "Corner Plot", icon: "SquareCode" },
  "servant-quarter": { label: "Servant Quarter", icon: "Home" },
  "store-room": { label: "Store Room", icon: "Box" },
  "lawn-garden": { label: "Lawn / Garden", icon: "Flower2" },
  basement: { label: "Basement", icon: "ArrowDownToLine" },
  "solar-panels": { label: "Solar Panels", icon: "Sun" },
  generator: { label: "Backup Generator", icon: "Zap" },
  lift: { label: "Lift / Elevator", icon: "ArrowUpDown" },
  cctv: { label: "CCTV", icon: "Camera" },
  "gas-connection": { label: "Gas Connection", icon: "Flame" },
};

export function getAmenityDisplay(slug: string): { label: string; icon: string } {
  return amenityCatalog[slug] ?? { label: slug.replace(/-/g, " "), icon: "ShieldCheck" };
}
