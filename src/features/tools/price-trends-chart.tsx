"use client";

import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Table as TableIcon, TrendingUp } from "lucide-react";
import { formatPriceShort } from "@/lib/currency";
import { ChartTooltip, legendInk, pkrTick } from "@/components/charts/chart-tooltip";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PhaseTrends } from "@/features/file-rate/server/queries";

/** Six validated categorical slots; past that the story needs another chart, not a 7th hue. */
const MAX_SERIES = 6;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

export function PriceTrendsChart({ phases }: { phases: PhaseTrends[] }) {
  const [phase, setPhase] = React.useState(phases[0]?.phase ?? "");
  const [view, setView] = React.useState<"chart" | "table">("chart");

  const current = phases.find((p) => p.phase === phase);
  const series = React.useMemo(
    () => current?.series.slice(0, MAX_SERIES) ?? [],
    [current],
  );
  const hiddenCount = (current?.series.length ?? 0) - series.length;

  // Pivot to one row per date so all lines share the x-axis; gaps stay null.
  const rows = React.useMemo(() => {
    const dates = Array.from(
      new Set(series.flatMap((s) => s.points.map((p) => p.date))),
    ).sort();
    return dates.map((date) => {
      const row: Record<string, string | number | null> = { date };
      for (const s of series) {
        row[s.id] = s.points.find((p) => p.date === date)?.value ?? null;
      }
      return row;
    });
  }, [series]);

  if (phases.length === 0) {
    return (
      <p className="text-ink-500 text-sm">
        No price history yet — trends appear once file rates have been updated more than
        once.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={phase} onValueChange={setPhase}>
          <SelectTrigger className="w-56" aria-label="Phase">
            <SelectValue>{phase}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {phases.map((p) => (
              <SelectItem key={p.phase} value={p.phase}>
                {p.phase}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-1">
          <Button
            variant={view === "chart" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("chart")}
            aria-pressed={view === "chart"}
          >
            <TrendingUp className="size-4" />
            Chart
          </Button>
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
            aria-pressed={view === "table"}
          >
            <TableIcon className="size-4" />
            Table
          </Button>
        </div>
      </div>

      {hiddenCount > 0 && (
        <p className="text-ink-500 text-xs">
          Showing the first {MAX_SERIES} of {current?.series.length} rates in {phase}; the
          rest are on the file rates page.
        </p>
      )}

      {view === "chart" ? (
        <div className="border-line bg-surface rounded-2xl border p-5">
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid
                  stroke="var(--chart-grid)"
                  strokeWidth={1}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "var(--chart-axis)" }}
                  tick={{ fill: "var(--ink-400)", fontSize: 11 }}
                  tickFormatter={formatDate}
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--ink-400)", fontSize: 11 }}
                  tickFormatter={pkrTick}
                  width={76}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      labelFormatter={(d) =>
                        new Date(String(d)).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      }
                    />
                  }
                  cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
                />
                {series.length > 1 && (
                  <Legend
                    formatter={legendInk}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, color: "var(--ink-600)" }}
                  />
                )}
                {series.map((s, i) => (
                  <Line
                    key={s.id}
                    type="monotone"
                    dataKey={s.id}
                    name={s.label}
                    stroke={`var(--chart-${i + 1})`}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {series.map((s) => (
                  <TableHead key={s.id} className="text-right">
                    {s.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={String(row.date)}>
                  <TableCell className="text-sm">
                    {formatDate(String(row.date))}
                  </TableCell>
                  {series.map((s) => (
                    <TableCell key={s.id} className="text-right text-sm tabular-nums">
                      {typeof row[s.id] === "number"
                        ? formatPriceShort(row[s.id] as number)
                        : "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
