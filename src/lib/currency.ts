import { SQFT_PER_MARLA } from "./units";

export const PKR_LAC = 100_000n;
export const PKR_CRORE = 10_000_000n;

/** Pakistani digit grouping (lakh/crore): 12500000 -> "1,25,00,000". */
export function formatPkrGrouped(amount: bigint | number): string {
  return new Intl.NumberFormat("en-IN").format(amount);
}

function trimDecimal(value: number): string {
  if (Number.isInteger(value)) return value.toFixed(0);
  return value.toFixed(2).replace(/0$/, "").replace(/\.$/, "");
}

/** 9,500,000 -> "95 Lac", 12,500,000 -> "1.25 Crore", small amounts -> "Rs 85,000". */
export function formatPriceShort(
  amount: bigint | number,
  opts?: { priceOnRequest?: boolean },
): string {
  if (opts?.priceOnRequest) return "Call for Price";

  const n = typeof amount === "bigint" ? amount : BigInt(Math.round(amount));
  if (n === 0n) return "Call for Price";

  const abs = n < 0n ? -n : n;
  const sign = n < 0n ? "-" : "";

  if (abs >= PKR_CRORE) {
    return `${sign}${trimDecimal(Number(abs) / Number(PKR_CRORE))} Crore`;
  }
  if (abs >= PKR_LAC) {
    return `${sign}${trimDecimal(Number(abs) / Number(PKR_LAC))} Lac`;
  }
  return `${sign}Rs ${formatPkrGrouped(abs)}`;
}

/** Full grouped rupee figure, e.g. "Rs 1,25,00,000". */
export function formatPkrFull(
  amount: bigint | number,
  opts?: { priceOnRequest?: boolean },
): string {
  if (opts?.priceOnRequest) return "Call for Price";
  return `Rs ${formatPkrGrouped(amount)}`;
}

/** Price per Marla, rounded to the nearest rupee. */
export function pricePerMarla(price: bigint, areaSqft: number): bigint {
  const marla = areaSqft / SQFT_PER_MARLA;
  if (marla <= 0) return 0n;
  return BigInt(Math.round(Number(price) / marla));
}

const FX_LABELS = { USD: "$", GBP: "£", AED: "AED " } as const;
export type FxCurrency = keyof typeof FX_LABELS;

/** Overseas-buyer display toggle — rate is admin-editable (FX_*_PER_PKR env vars for now). */
export function convertPkrToFx(
  amountPkr: bigint | number,
  ratePerPkr: number,
  currency: FxCurrency,
): string {
  const value = Number(amountPkr) * ratePerPkr;
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    value,
  );
  return `${FX_LABELS[currency]}${formatted}`;
}
