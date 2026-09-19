/**
 * The standard Lahore location tree an admin can import in one click from
 * /admin/areas. This is real geography (DHA's phases and the city's major
 * societies), not demo content — a fresh production database has no
 * locations at all, and listings and file rates can't be created until a
 * phase exists to attach them to.
 *
 * Order matters: parents come before children. Entries are created only
 * when the slug is missing, so re-importing never overwrites admin edits.
 * Coordinates are left out where we don't have a confident value; the
 * admin can add them from the area's edit page.
 */
import type { LocationType } from "@/generated/prisma/enums";

export interface ReferenceLocation {
  slug: string;
  name: string;
  nameUr?: string;
  type: LocationType;
  parentSlug?: string;
  lat?: number;
  lng?: number;
  popularityRank?: number;
}

const phase = (
  n: string,
  slug: string,
  nameUr: string,
  rank: number,
  coords?: [number, number],
): ReferenceLocation => ({
  slug,
  name: n,
  nameUr,
  type: "PHASE",
  parentSlug: "dha-lahore",
  popularityRank: rank,
  ...(coords ? { lat: coords[0], lng: coords[1] } : {}),
});

const society = (
  name: string,
  slug: string,
  nameUr?: string,
  coords?: [number, number],
): ReferenceLocation => ({
  slug,
  name,
  nameUr,
  type: "SOCIETY",
  parentSlug: "lahore",
  ...(coords ? { lat: coords[0], lng: coords[1] } : {}),
});

export const referenceLocations: ReferenceLocation[] = [
  {
    slug: "lahore",
    name: "Lahore",
    nameUr: "لاہور",
    type: "CITY",
    lat: 31.5204,
    lng: 74.3587,
  },
  {
    slug: "dha-lahore",
    name: "DHA Lahore",
    nameUr: "ڈی ایچ اے لاہور",
    type: "SOCIETY",
    parentSlug: "lahore",
    lat: 31.4697,
    lng: 74.4,
  },

  phase("DHA Phase 1", "dha-phase-1", "ڈی ایچ اے فیز 1", 1, [31.4787, 74.4152]),
  phase("DHA Phase 2", "dha-phase-2", "ڈی ایچ اے فیز 2", 2, [31.4675, 74.423]),
  phase("DHA Phase 3", "dha-phase-3", "ڈی ایچ اے فیز 3", 3, [31.4751, 74.3855]),
  phase("DHA Phase 4", "dha-phase-4", "ڈی ایچ اے فیز 4", 4, [31.4675, 74.3985]),
  phase("DHA Phase 5", "dha-phase-5", "ڈی ایچ اے فیز 5", 5, [31.4611, 74.4144]),
  phase("DHA Phase 6", "dha-phase-6", "ڈی ایچ اے فیز 6", 6, [31.4491, 74.409]),
  phase("DHA Phase 7", "dha-phase-7", "ڈی ایچ اے فیز 7", 7, [31.4373, 74.4133]),
  phase("DHA Phase 8", "dha-phase-8", "ڈی ایچ اے فیز 8", 8, [31.4675, 74.3512]),
  phase(
    "DHA Phase 9 Prism",
    "dha-phase-9-prism",
    "ڈی ایچ اے فیز 9 پرزم",
    9,
    [31.4028, 74.3405],
  ),
  phase("DHA Phase 9 Town", "dha-phase-9-town", "ڈی ایچ اے فیز 9 ٹاؤن", 10),
  phase("DHA Phase 10", "dha-phase-10", "ڈی ایچ اے فیز 10", 11, [31.385, 74.32]),
  phase(
    "DHA Phase 11 Rahbar",
    "dha-phase-11-rahbar",
    "ڈی ایچ اے فیز 11 رہبر",
    12,
    [31.37, 74.3],
  ),
  phase(
    "DHA Phase 12 (EME)",
    "dha-phase-12",
    "ڈی ایچ اے فیز 12 (ای ایم ای)",
    13,
    [31.355, 74.28],
  ),
  phase("DHA Phase 13", "dha-phase-13", "ڈی ایچ اے فیز 13", 14),

  society("Bahria Town Lahore", "bahria-town", "بحریہ ٹاؤن لاہور", [31.3686, 74.1758]),
  society("Model Town", "model-town", "ماڈل ٹاؤن", [31.4805, 74.3229]),
  society("Gulberg", "gulberg", "گلبرگ"),
  society("Johar Town", "johar-town", "جوہر ٹاؤن", [31.4697, 74.2728]),
  society("Cavalry Ground", "cavalry-ground", "کیولری گراؤنڈ", [31.5277, 74.36]),
  society("Askari 10", "askari-10", "عسکری 10", [31.42, 74.27]),
  society("Askari 11", "askari-11", "عسکری 11"),
  society("Paragon City", "paragon-city", "پیراگون سٹی", [31.4453, 74.2879]),
  society("Valencia Town", "valencia-town", "ویلنسیا ٹاؤن", [31.4405, 74.247]),
  society("Wapda Town", "wapda-town", "واپڈا ٹاؤن"),
  society("Lake City", "lake-city", "لیک سٹی"),
  society("Park View City", "park-view-city", "پارک ویو سٹی"),
  society("EME Society", "eme-society", "ای ایم ای سوسائٹی", [31.4589, 74.3379]),
  society("Raya", "raya", "رایا"),
];
