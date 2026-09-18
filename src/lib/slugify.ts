export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Appends -2, -3, … until `taken` says the slug is free. `ignoreId` lets an
 * edit keep its own slug without colliding with itself.
 */
export async function uniqueSlug(
  base: string,
  taken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "item";
  let slug = root;
  let suffix = 2;
  while (await taken(slug)) {
    slug = `${root}-${suffix++}`;
  }
  return slug;
}

/** Splits "a, b ,c" into ["a", "b", "c"], dropping empties. */
export function parseCommaList(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
