import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";
import { parsePropertySearchParams } from "@/features/property/schema";
import { searchProperties } from "@/features/property/server/queries";
import { SearchFilters } from "@/features/property/components/search-filters";
import { PropertySearchResults } from "@/features/property/components/property-search-results";
import { PropertyPagination } from "@/features/property/components/property-pagination";

export const metadata: Metadata = {
  alternates: localizedAlternates("/properties"),
  title: "Properties for Sale & Rent in DHA Lahore",
  description:
    "Browse verified houses, plots, plot files and commercial properties across DHA Lahore and surrounding societies.",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const rawParams = await searchParams;
  const filters = parsePropertySearchParams(rawParams);
  const results = await searchProperties(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-ink-900 text-2xl font-bold sm:text-3xl">
          {filters.purpose === "RENT" ? "Properties for Rent" : "Properties for Sale"} in
          DHA Lahore
        </h1>
        <p className="text-ink-600 mt-1 text-sm" aria-live="polite">
          {results.totalCount.toLocaleString()}{" "}
          {results.totalCount === 1 ? "property" : "properties"} found
        </p>
      </div>

      <SearchFilters />

      <div className="mt-6">
        <PropertySearchResults items={results.items} />
      </div>

      <PropertyPagination
        page={results.page}
        totalPages={results.totalPages}
        searchParams={rawParams}
      />
    </div>
  );
}
