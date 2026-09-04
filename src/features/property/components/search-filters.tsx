"use client";

import * as React from "react";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sortOptions } from "../schema";

const typeOptions = [
  { value: "", label: "Any type" },
  { value: "HOUSE", label: "House" },
  { value: "FLAT", label: "Flat" },
  { value: "UPPER_PORTION", label: "Upper Portion" },
  { value: "PLOT", label: "Plot" },
  { value: "PLOT_FILE", label: "Plot File" },
  { value: "SHOP", label: "Shop" },
  { value: "OFFICE", label: "Office" },
  { value: "FARMHOUSE", label: "Farmhouse" },
  { value: "PENTHOUSE", label: "Penthouse" },
];

const sortLabels: Record<(typeof sortOptions)[number], string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "area-asc": "Area: Small to Large",
  "area-desc": "Area: Large to Small",
  popular: "Most Popular",
};

export function SearchFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      purpose: parseAsString.withDefault(""),
      type: parseAsString.withDefault(""),
      q: parseAsString.withDefault(""),
      priceMin: parseAsInteger,
      priceMax: parseAsInteger,
      beds: parseAsInteger,
      sort: parseAsString.withDefault("newest"),
      page: parseAsInteger,
    },
    { shallow: false, clearOnDefault: true },
  );

  const [showMore, setShowMore] = React.useState(false);
  const hasActiveFilters =
    filters.purpose ||
    filters.type ||
    filters.q ||
    filters.priceMin ||
    filters.priceMax ||
    filters.beds;

  // Local state + debounce for the free-text field so typing doesn't fire a
  // server round-trip on every keystroke. Resyncing qDraft when the URL's q
  // changes (e.g. "Clear") happens during render, not in an effect — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevUrlQ, setPrevUrlQ] = React.useState(filters.q);
  const [qDraft, setQDraft] = React.useState(filters.q);
  if (filters.q !== prevUrlQ) {
    setPrevUrlQ(filters.q);
    setQDraft(filters.q);
  }
  React.useEffect(() => {
    if (qDraft === filters.q) return;
    const id = setTimeout(() => setFilters({ q: qDraft || null, page: null }), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDraft]);

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={filters.purpose || "ALL"}
        onValueChange={(v) => setFilters({ purpose: v === "ALL" ? null : v, page: null })}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="SALE">Buy</TabsTrigger>
          <TabsTrigger value="RENT">Rent</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={qDraft}
          onChange={(e) => setQDraft(e.target.value)}
          placeholder="Search by title, location or Property ID"
          className="bg-surface h-10 w-full max-w-xs"
        />

        <Select
          value={filters.type || "ANY"}
          onValueChange={(v) => setFilters({ type: v === "ANY" ? null : v, page: null })}
        >
          <SelectTrigger className="bg-surface h-10">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((opt) => (
              <SelectItem key={opt.value || "ANY"} value={opt.value || "ANY"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="h-10 gap-1.5"
          onClick={() => setShowMore((v) => !v)}
        >
          <SlidersHorizontal className="size-4" />
          More filters
        </Button>

        <Select value={filters.sort} onValueChange={(v) => setFilters({ sort: v })}>
          <SelectTrigger className="bg-surface h-10 sm:ml-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {sortLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-ink-600 h-10 gap-1"
            onClick={() => {
              setQDraft("");
              setFilters({
                purpose: null,
                type: null,
                q: null,
                priceMin: null,
                priceMax: null,
                beds: null,
                page: null,
              });
            }}
          >
            <X className="size-4" /> Clear
          </Button>
        )}
      </div>

      {showMore && (
        <div className="border-line bg-surface-2 flex flex-wrap items-end gap-3 rounded-xl border p-4">
          <div className="flex flex-col gap-1">
            <label className="text-ink-600 text-xs font-medium" htmlFor="price-min">
              Min Price (PKR)
            </label>
            <Input
              id="price-min"
              type="number"
              className="bg-surface h-9 w-32"
              value={filters.priceMin ?? ""}
              onChange={(e) =>
                setFilters({
                  priceMin: e.target.value ? Number(e.target.value) : null,
                  page: null,
                })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-ink-600 text-xs font-medium" htmlFor="price-max">
              Max Price (PKR)
            </label>
            <Input
              id="price-max"
              type="number"
              className="bg-surface h-9 w-32"
              value={filters.priceMax ?? ""}
              onChange={(e) =>
                setFilters({
                  priceMax: e.target.value ? Number(e.target.value) : null,
                  page: null,
                })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-ink-600 text-xs font-medium" htmlFor="beds">
              Min Beds
            </label>
            <Input
              id="beds"
              type="number"
              className="bg-surface h-9 w-24"
              value={filters.beds ?? ""}
              onChange={(e) =>
                setFilters({
                  beds: e.target.value ? Number(e.target.value) : null,
                  page: null,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
