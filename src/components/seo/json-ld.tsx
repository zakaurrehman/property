/**
 * Renders a schema.org JSON-LD block. `<` is escaped to < so a value that
 * happens to contain "</script>" can't break out of the tag (per the Next.js
 * JSON-LD guide — JSON.stringify alone doesn't sanitise).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
