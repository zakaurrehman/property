export const SQFT_PER_MARLA = 225;
export const MARLA_PER_KANAL = 20;
export const SQFT_PER_KANAL = SQFT_PER_MARLA * MARLA_PER_KANAL; // 4500
export const SQFT_PER_SQYD = 9;

export type AreaUnit = "MARLA" | "KANAL" | "SQFT" | "SQYD";

/** Converts a value in the given display unit to sqft — the only unit stored in the DB. */
export function toSqft(value: number, unit: AreaUnit): number {
  switch (unit) {
    case "MARLA":
      return value * SQFT_PER_MARLA;
    case "KANAL":
      return value * SQFT_PER_KANAL;
    case "SQYD":
      return value * SQFT_PER_SQYD;
    case "SQFT":
      return value;
  }
}

export function fromSqft(sqft: number, unit: AreaUnit): number {
  switch (unit) {
    case "MARLA":
      return sqft / SQFT_PER_MARLA;
    case "KANAL":
      return sqft / SQFT_PER_KANAL;
    case "SQYD":
      return sqft / SQFT_PER_SQYD;
    case "SQFT":
      return sqft;
  }
}

/**
 * Pakistani real-estate convention: sizes at or above 1 Kanal are usually
 * read as "X Kanal Y Marla" rather than a single large Marla figure.
 */
export function formatAreaLabel(sqft: number, preferredUnit: AreaUnit = "MARLA"): string {
  if (preferredUnit === "SQFT") {
    return `${Math.round(sqft).toLocaleString("en-US")} Sq Ft`;
  }
  if (preferredUnit === "SQYD") {
    return `${Math.round(sqft / SQFT_PER_SQYD).toLocaleString("en-US")} Sq Yd`;
  }

  const totalMarla = sqft / SQFT_PER_MARLA;
  let kanal = Math.floor(totalMarla / MARLA_PER_KANAL);
  let marla = Math.round(totalMarla - kanal * MARLA_PER_KANAL);
  if (marla === MARLA_PER_KANAL) {
    kanal += 1;
    marla = 0;
  }

  if (preferredUnit === "KANAL" || kanal > 0) {
    if (kanal > 0 && marla > 0) return `${kanal} Kanal ${marla} Marla`;
    if (kanal > 0) return `${kanal} Kanal`;
  }
  return `${Math.round(totalMarla)} Marla`;
}
