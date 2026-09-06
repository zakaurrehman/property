import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrendIndicator({ trend }: { trend: string }) {
  if (trend === "UP") {
    return (
      <span className={cn("inline-flex items-center gap-0.5 text-emerald-600")}>
        <ArrowUpRight className="size-3.5" /> Up
      </span>
    );
  }
  if (trend === "DOWN") {
    return (
      <span className={cn("inline-flex items-center gap-0.5 text-red-600")}>
        <ArrowDownRight className="size-3.5" /> Down
      </span>
    );
  }
  return (
    <span className="text-ink-500 inline-flex items-center gap-0.5">
      <Minus className="size-3.5" /> Flat
    </span>
  );
}
