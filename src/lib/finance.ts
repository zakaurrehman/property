/**
 * Pure calculators behind /tools. All money in whole PKR, rates in percent
 * (e.g. 14 for 14%), so the inputs read the way a Pakistani buyer types them.
 */

export interface MortgageInput {
  price: number;
  downPaymentPct: number;
  annualRatePct: number;
  years: number;
}

export interface MortgageResult {
  principal: number;
  downPayment: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  /** Per-year balance so a chart can show the loan paying down. */
  schedule: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    balance: number;
  }[];
}

/** Standard amortised loan: M = P·r / (1 − (1 + r)^−n), r = monthly rate. Zero-rate loans divide evenly. */
export function calculateMortgage(input: MortgageInput): MortgageResult {
  const downPayment = Math.round((input.price * input.downPaymentPct) / 100);
  const principal = Math.max(0, input.price - downPayment);
  const months = Math.max(1, Math.round(input.years * 12));
  const r = input.annualRatePct / 100 / 12;

  const monthlyPayment =
    r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));

  const schedule: MortgageResult["schedule"] = [];
  let balance = principal;
  let yearPrincipal = 0;
  let yearInterest = 0;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    const principalPart = Math.min(balance, monthlyPayment - interest);
    balance -= principalPart;
    yearPrincipal += principalPart;
    yearInterest += interest;
    if (m % 12 === 0 || m === months) {
      schedule.push({
        year: Math.ceil(m / 12),
        principalPaid: Math.round(yearPrincipal),
        interestPaid: Math.round(yearInterest),
        balance: Math.max(0, Math.round(balance)),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  const totalPaid = monthlyPayment * months;
  return {
    principal,
    downPayment,
    monthlyPayment: Math.round(monthlyPayment),
    totalPaid: Math.round(totalPaid),
    totalInterest: Math.round(totalPaid - principal),
    schedule,
  };
}

export interface InvestmentInput {
  price: number;
  /** Expected capital appreciation per year, % */
  appreciationPct: number;
  /** Gross rental yield per year as % of purchase price; 0 for a plot/file. */
  rentalYieldPct: number;
  years: number;
  /** One-off buying + selling costs (transfer, commission, stamp) as % of price. */
  transactionCostsPct: number;
}

export interface InvestmentResult {
  finalValue: number;
  capitalGain: number;
  totalRent: number;
  transactionCosts: number;
  netProfit: number;
  roiPct: number;
  annualisedPct: number;
  /** Year-by-year value + cumulative rent for charting. */
  timeline: { year: number; value: number; cumulativeRent: number }[];
}

/** Compound appreciation on value; rent is a flat % of the original price each year. */
export function projectInvestment(input: InvestmentInput): InvestmentResult {
  const years = Math.max(1, Math.round(input.years));
  const growth = 1 + input.appreciationPct / 100;
  const annualRent = (input.price * input.rentalYieldPct) / 100;

  const timeline: InvestmentResult["timeline"] = [];
  let value = input.price;
  let cumulativeRent = 0;
  for (let y = 1; y <= years; y++) {
    value *= growth;
    cumulativeRent += annualRent;
    timeline.push({
      year: y,
      value: Math.round(value),
      cumulativeRent: Math.round(cumulativeRent),
    });
  }

  const finalValue = Math.round(value);
  const capitalGain = finalValue - input.price;
  const totalRent = Math.round(cumulativeRent);
  const transactionCosts = Math.round((input.price * input.transactionCostsPct) / 100);
  const netProfit = capitalGain + totalRent - transactionCosts;
  const roiPct = input.price === 0 ? 0 : (netProfit / input.price) * 100;
  const annualisedPct =
    input.price === 0
      ? 0
      : (Math.pow((input.price + netProfit) / input.price, 1 / years) - 1) * 100;

  return {
    finalValue,
    capitalGain,
    totalRent,
    transactionCosts,
    netProfit,
    roiPct: Math.round(roiPct * 10) / 10,
    annualisedPct: Math.round(annualisedPct * 10) / 10,
    timeline,
  };
}
