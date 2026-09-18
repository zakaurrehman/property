"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calculateMortgage } from "@/lib/finance";
import { formatPkrFull, formatPriceShort } from "@/lib/currency";
import { ChartTooltip, pkrTick } from "@/components/charts/chart-tooltip";
import { NumberField } from "@/components/charts/number-field";
import { StatTile } from "@/components/charts/stat-tile";

export function MortgageCalculator() {
  const [price, setPrice] = React.useState(15_000_000);
  const [downPaymentPct, setDownPaymentPct] = React.useState(20);
  const [annualRatePct, setAnnualRatePct] = React.useState(14);
  const [years, setYears] = React.useState(15);

  const result = React.useMemo(
    () => calculateMortgage({ price, downPaymentPct, annualRatePct, years }),
    [price, downPaymentPct, annualRatePct, years],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <aside className="border-line bg-surface flex h-fit flex-col gap-5 rounded-2xl border p-6">
        <NumberField
          id="price"
          label="Property price"
          value={price}
          onChange={setPrice}
          min={1_000_000}
          max={200_000_000}
          step={500_000}
          suffix="PKR"
          hint={formatPriceShort(price)}
        />
        <NumberField
          id="down"
          label="Down payment"
          value={downPaymentPct}
          onChange={setDownPaymentPct}
          min={0}
          max={90}
          step={5}
          suffix="%"
          hint={formatPriceShort(result.downPayment)}
        />
        <NumberField
          id="rate"
          label="Interest / profit rate"
          value={annualRatePct}
          onChange={setAnnualRatePct}
          min={0}
          max={30}
          step={0.5}
          suffix="% p.a."
          hint="KIBOR + bank spread"
        />
        <NumberField
          id="years"
          label="Tenure"
          value={years}
          onChange={setYears}
          min={1}
          max={30}
          step={1}
          suffix="years"
        />
      </aside>

      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Monthly payment"
            value={formatPriceShort(result.monthlyPayment)}
            hint={formatPkrFull(result.monthlyPayment)}
            hero
            className="sm:col-span-2"
          />
          <StatTile label="Loan amount" value={formatPriceShort(result.principal)} />
          <StatTile
            label="Total interest"
            value={formatPriceShort(result.totalInterest)}
            hint={`${formatPriceShort(result.totalPaid)} paid in total`}
          />
        </div>

        <div className="border-line bg-surface rounded-2xl border p-5">
          <p className="text-ink-900 mb-1 font-medium">Remaining balance by year</p>
          <p className="text-ink-500 mb-4 text-xs">
            How the loan pays down — early years are mostly interest.
          </p>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={result.schedule}
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
                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Balance"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="var(--chart-1)"
                  fillOpacity={0.1}
                  dot={false}
                  activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-ink-500 text-xs">
          Indicative only. Pakistani banks price home finance off KIBOR plus a spread and
          may cap tenure or financing ratio; confirm terms with the bank. Islamic
          (diminishing musharakah) products use the same arithmetic on the rental rate.
        </p>
      </div>
    </div>
  );
}
