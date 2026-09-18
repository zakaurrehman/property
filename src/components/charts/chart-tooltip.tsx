"use client";

import { formatPriceShort } from "@/lib/currency";

interface TooltipEntry {
  name?: string | number;
  value?: number | string | null;
  color?: string;
  dataKey?: string | number;
}

/**
 * Recharts tooltip content in the app's own surface/ink tokens. Text stays in
 * ink; the coloured swatch beside each row carries series identity.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter = (v) => formatPriceShort(v),
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  labelFormatter?: (label: string | number) => string;
  valueFormatter?: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="border-line bg-surface rounded-lg border px-3 py-2 text-xs shadow-md">
      {label !== undefined && (
        <p className="text-ink-900 mb-1 font-medium">
          {labelFormatter ? labelFormatter(label) : String(label)}
        </p>
      )}
      <ul className="flex flex-col gap-0.5">
        {payload.map((entry) => (
          <li
            key={String(entry.dataKey ?? entry.name)}
            className="flex items-center gap-2"
          >
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: entry.color }}
              aria-hidden
            />
            <span className="text-ink-600">{entry.name}</span>
            <span className="text-ink-900 ml-auto pl-3 font-medium tabular-nums">
              {typeof entry.value === "number"
                ? valueFormatter(entry.value)
                : (entry.value ?? "—")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Axis tick formatter: 0 / 85 Lac / 1.25 Crore (formatPriceShort would print "Call for Price" at zero). */
export function pkrTick(value: number): string {
  return value === 0 ? "0" : formatPriceShort(value);
}

/** Recharts colours legend text with the series colour by default; keep text in ink. */
export function legendInk(value: string) {
  return <span style={{ color: "var(--ink-600)" }}>{value}</span>;
}
