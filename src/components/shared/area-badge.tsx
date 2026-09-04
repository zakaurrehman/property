import { formatAreaLabel, type AreaUnit } from "@/lib/units";

export function AreaBadge({
  areaSqft,
  unit = "MARLA",
}: {
  areaSqft: number;
  unit?: AreaUnit;
}) {
  return <span className="tabular-nums">{formatAreaLabel(areaSqft, unit)}</span>;
}
