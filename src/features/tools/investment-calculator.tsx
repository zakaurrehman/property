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
import { projectInvestment } from "@/lib/finance";
import { formatPriceShort } from "@/lib/currency";
import { ChartTooltip, legendInk, pkrTick } from "@/components/charts/chart-tooltip";
import { NumberField } from "@/components/charts/number-field";
import { StatTile } from "@/components/charts/stat-tile";

export function InvestmentCalculator() {
  const [price, setPrice] = React.useState(20_000_000);
  const [appreciationPct, setAppreciationPct] = React.useState(10);
  const [rentalYieldPct, setRentalYieldPct] = React.useState(4);
  const [years, setYears] = React.useState(5);
  const [transactionCostsPct, setTransactionCostsPct] = React.useState(3);

  const result = React.useMemo(
    () =>
      projectInvestment({
        price,
        appreciationPct,
        rentalYieldPct,
        years,
        transactionCostsPct,
      }),
    [price, appreciationPct, rentalYieldPct, years, transactionCostsPct],
  );

  const sign = result.netProfit >= 0 ? "+" : "−";

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <aside className="border-line bg-surface flex h-fit flex-col gap-5 rounded-2xl border p-6">
        <NumberField
          id="inv-price"
          label="Purchase price"
          value={price}
          onChange={setPrice}
          min={1_000_000}
          max={300_000_000}
          step={500_000}
          suffix="PKR"
          hint={formatPriceShort(price)}
        />
        <NumberField
          id="inv-appreciation"
          label="Expected appreciation"
          value={appreciationPct}
          onChange={setAppreciationPct}
          min={-10}
          max={40}
          step={0.5}
          suffix="% / yr"
          hint="DHA phases have averaged 8–15%"
        />
        <NumberField
          id="inv-yield"
          label="Rental yield"
          value={rentalYieldPct}
          onChange={setRentalYieldPct}
          min={0}
          max={15}
          step={0.5}
          suffix="% / yr"
          hint="0 for a plot or file"
        />
        <NumberField
          id="inv-years"
          label="Holding period"
          value={years}
          onChange={setYears}
          min={1}
          max={30}
          step={1}
          suffix="years"
        />
        <NumberField
          id="inv-costs"
          label="Buying + selling costs"
          value={transactionCostsPct}
          onChange={setTransactionCostsPct}
          min={0}
          max={15}
          step={0.5}
          suffix="%"
          hint="Transfer, commission, stamp duty"
        />
      </aside>

      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label={`Net profit over ${years} year${years === 1 ? "" : "s"}`}
            value={`${sign}${formatPriceShort(Math.abs(result.netProfit))}`}
            hint={`${result.roiPct}% total return`}
            hero
            className="sm:col-span-2"
          />
          <StatTile
            label="Annualised return"
            value={`${result.annualisedPct}%`}
            hint="Compound, net of costs"
          />
          <StatTile
            label="Value at exit"
            value={formatPriceShort(result.finalValue)}
            hint={`+${formatPriceShort(result.totalRent)} rent collected`}
          />
        </div>

        <div className="border-line bg-surface rounded-2xl border p-5">
          <p className="text-ink-900 mb-1 font-medium">
            Property value and cumulative rent
          </p>
          <p className="text-ink-500 mb-4 text-xs">Both in PKR on the same axis.</p>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={result.timeline}
                margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
              >
                <CartesianGrid
                  stroke="var(--chart-grid)"
                  strokeWidth={1}
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={{ stroke: "var(--chart-axis)" }}
                  tick={{ fill: "var(--ink-400)", fontSize: 11 }}
                  tickFormatter={(y: number) => `Y${y}`}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--ink-400)", fontSize: 11 }}
                  tickFormatter={pkrTick}
                  width={72}
                />
                <Tooltip
                  content={<ChartTooltip labelFormatter={(y) => `Year ${y}`} />}
                  cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
                />
                <Legend
                  formatter={legendInk}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: "var(--ink-600)" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Property value"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeRent"
                  name="Cumulative rent"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-ink-500 text-xs">
          A projection, not a forecast — appreciation is assumed constant and rent is a
          flat share of the purchase price. Use the file-rate trends to sanity-check the
          appreciation figure for a specific phase.
        </p>
      </div>
    </div>
  );
}
