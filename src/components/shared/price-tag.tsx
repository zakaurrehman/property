import { formatPriceShort, pricePerMarla } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function PriceTag({
  price,
  priceOnRequest,
  areaSqft,
  rentPeriod,
  showPerMarla = true,
  className,
}: {
  price: bigint;
  priceOnRequest: boolean;
  areaSqft: number;
  rentPeriod?: "MONTHLY" | "YEARLY" | null;
  showPerMarla?: boolean;
  className?: string;
}) {
  const perMarla = pricePerMarla(price, areaSqft);

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="font-heading text-brand-900 dark:text-ink-900 text-lg font-bold tabular-nums">
        {formatPriceShort(price, { priceOnRequest })}
        {rentPeriod && !priceOnRequest && (
          <span className="text-ink-400 ml-1 text-xs font-normal">
            /{rentPeriod === "MONTHLY" ? "mo" : "yr"}
          </span>
        )}
      </span>
      {showPerMarla && !priceOnRequest && perMarla > 0n && (
        <span className="text-ink-400 text-xs tabular-nums">
          {formatPriceShort(perMarla)} / Marla
        </span>
      )}
    </div>
  );
}
