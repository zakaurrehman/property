"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PurposeTab = "buy" | "rent" | "plots" | "files" | "commercial";

const tabToQuery: Record<PurposeTab, Record<string, string>> = {
  buy: { purpose: "SALE" },
  rent: { purpose: "RENT" },
  plots: { purpose: "SALE", type: "PLOT" },
  files: { purpose: "SALE", type: "PLOT_FILE" },
  commercial: { category: "COMMERCIAL" },
};

const propertyTypes = [
  { value: "HOUSE", label: "House" },
  { value: "FLAT", label: "Flat" },
  { value: "UPPER_PORTION", label: "Upper Portion" },
  { value: "PLOT", label: "Plot" },
  { value: "PLOT_FILE", label: "Plot File" },
  { value: "SHOP", label: "Shop" },
  { value: "OFFICE", label: "Office" },
];

const bedOptions = ["1", "2", "3", "4", "5+"];

export function HeroSearch() {
  const t = useTranslations("home");
  const router = useRouter();

  const [tab, setTab] = React.useState<PurposeTab>("buy");
  const [location, setLocation] = React.useState("");
  const [type, setType] = React.useState<string | undefined>(undefined);
  const [beds, setBeds] = React.useState<string | undefined>(undefined);
  const [refCode, setRefCode] = React.useState("");

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(tabToQuery[tab]);
    if (location) params.set("q", location);
    if (type) params.set("type", type);
    if (beds) params.set("beds", beds);
    router.push(`/properties?${params.toString()}`);
  }

  function handleRefLookup(event: React.FormEvent) {
    event.preventDefault();
    if (!refCode) return;
    router.push(`/properties?ref=${encodeURIComponent(refCode)}`);
  }

  return (
    <div className="glass w-full max-w-3xl rounded-2xl border border-white/20 p-4 shadow-xl sm:p-6">
      <Tabs value={tab} onValueChange={(v) => setTab(v as PurposeTab)}>
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="buy">{t("tabBuy")}</TabsTrigger>
          <TabsTrigger value="rent">{t("tabRent")}</TabsTrigger>
          <TabsTrigger value="plots">{t("tabPlots")}</TabsTrigger>
          <TabsTrigger value="files">{t("tabFiles")}</TabsTrigger>
          <TabsTrigger value="commercial">{t("tabCommercial")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="hero-location" className="sr-only">
            {t("searchLocationLabel")}
          </label>
          <Input
            id="hero-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("searchLocationPlaceholder")}
            className="bg-surface h-11"
          />
        </div>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="bg-surface h-11 w-full">
            <SelectValue placeholder={t("searchTypeLabel")} />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((pt) => (
              <SelectItem key={pt.value} value={pt.value}>
                {pt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={beds} onValueChange={setBeds}>
          <SelectTrigger className="bg-surface h-11 w-full">
            <SelectValue placeholder={t("searchBedsLabel")} />
          </SelectTrigger>
          <SelectContent>
            {bedOptions.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" size="lg" className="h-11 sm:col-span-4">
          {t("searchSubmit")}
        </Button>
      </form>

      <form
        onSubmit={handleRefLookup}
        className="mt-3 flex items-center gap-2 border-t border-white/20 pt-3"
      >
        <label htmlFor="hero-ref" className="text-ink-600 text-xs whitespace-nowrap">
          {t("searchByIdLabel")}
        </label>
        <Input
          id="hero-ref"
          value={refCode}
          onChange={(e) => setRefCode(e.target.value)}
          placeholder={t("searchByIdPlaceholder")}
          className="bg-surface h-9 max-w-[160px] text-sm"
        />
        <Button type="submit" variant="outline" size="sm">
          {t("searchByIdSubmit")}
        </Button>
      </form>
    </div>
  );
}
