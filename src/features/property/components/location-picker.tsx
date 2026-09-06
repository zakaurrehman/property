"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  searchLocations,
  type LocationSearchResult,
} from "@/features/location/server/actions";

export function LocationPicker({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string | undefined;
  onChange: (location: LocationSearchResult) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup only — the actual search is triggered from the input's onValueChange
  // handler below, not from an effect watching `query` (avoids a synchronous
  // setState-in-effect for the "query too short" branch).
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleQueryChange(next: string) {
    setQuery(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (next.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      searchLocations(next)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 250);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span
            className={cn("flex items-center gap-2 truncate", !value && "text-ink-500")}
          >
            <MapPin className="size-4 shrink-0" />
            {label || "Search for a location…"}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type a location name…"
            value={query}
            onValueChange={handleQueryChange}
          />
          <CommandList>
            {loading && (
              <div className="text-ink-500 flex items-center justify-center gap-2 py-4 text-sm">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </div>
            )}
            {!loading && query.trim().length >= 2 && (
              <CommandEmpty>No locations found.</CommandEmpty>
            )}
            <CommandGroup>
              {results.map((loc) => (
                <CommandItem
                  key={loc.id}
                  value={loc.id}
                  onSelect={() => {
                    onChange(loc);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value === loc.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {loc.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
