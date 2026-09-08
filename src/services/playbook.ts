// Core scoring logic distilled from "The Investing Playbook"
// (Kenneth, Aug 2026) — Sections 2-8: ratio targets, Graham intrinsic
// value + margin of safety, red-flag rules, and the one-page checklist.

import { Grade } from '../theme/theme';

export type MetricKey =
  | 'grossMargin'
  | 'netMargin'
  | 'roe'
  | 'roic'
  | 'currentRatio'
  | 'debtToEquity'
  | 'peRatio'
  | 'dividendYield';

export interface MetricDef {
  key: MetricKey;
  label: string;
  formula: string;
  target: string;
  unit: '%' | 'x' | 'ratio';
  /** Higher reading is better unless invert=true (e.g. P/E, D/E) */
  invert?: boolean;
  /** Reference value used to normalize the gauge fill (0..1) */
  gaugeMax: number;
  /** Numeric pass-bar used to draw the threshold tick on the gauge */
  thresholdValue: number;
}

export const METRICS: MetricDef[] = [
  { key: 'grossMargin', label: 'Gross Margin', formula: 'Gross Profit ÷ Revenue', target: '> 40%', unit: '%', gaugeMax: 80, thresholdValue: 40 },
  { key: 'netMargin', label: 'Net Margin', formula: 'Net Income ÷ Revenue', target: '> 10-20%', unit: '%', gaugeMax: 40, thresholdValue: 20 },
  { key: 'roe', label: 'Return on Equity', formula: 'Net Income ÷ Equity', target: '> 15-20%', unit: '%', gaugeMax: 40, thresholdValue: 20 },
  { key: 'roic', label: 'Return on Inv. Capital', formula: 'NOPAT ÷ Invested Capital', target: '> 15%', unit: '%', gaugeMax: 30, thresholdValue: 15 },
  { key: 'currentRatio', label: 'Current Ratio', formula: 'Current Assets ÷ Current Liab.', target: '> 1.5', unit: 'x', gaugeMax: 3, thresholdValue: 1.5 },
  { key: 'debtToEquity', label: 'Debt / Equity', formula: 'Liabilities ÷ Equity', target: '< 1.0', unit: 'x', invert: true, gaugeMax: 2, thresholdValue: 1.0 },
  { key: 'peRatio', label: 'Price / Earnings (TTM)', formula: 'Price ÷ EPS', target: '< 20', unit: 'x', invert: true, gaugeMax: 40, thresholdValue: 20 },
  { key: 'dividendYield', label: 'Dividend Yield', formula: 'Dividend ÷ Price', target: '> 2%', unit: '%', gaugeMax: 6, thresholdValue: 2 },
];

export function thresholdFraction(def: MetricDef): number {
  return Math.max(0, Math.min(1, def.thresholdValue / def.gaugeMax));
}

export function gradeMetric(key: MetricKey, value: number | null | undefined): Grade {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  switch (key) {
    case 'grossMargin':
      if (value >= 40) return 'STRONG';
      if (value >= 25) return 'OK';
      if (value >= 10) return 'WATCH';
      return 'FAIL';
    case 'netMargin':
      if (value >= 20) return 'STRONG';
      if (value >= 10) return 'OK';
      if (value >= 0) return 'WATCH';
      return 'FAIL';
    case 'roe':
      if (value >= 20) return 'STRONG';
      if (value >= 15) return 'OK';
      if (value >= 0) return 'WATCH';
      return 'FAIL';
    case 'roic':
      if (value >= 15) return 'STRONG';
      if (value >= 8) return 'OK';
      if (value >= 0) return 'WATCH';
      return 'FAIL';
    case 'currentRatio':
      if (value >= 1.5) return 'PASS';
      if (value >= 1.0) return 'OK';
      if (value >= 0.7) return 'WATCH';
      return 'FAIL';
    case 'debtToEquity':
      if (value <= 0.5) return 'STRONG';
      if (value <= 1.0) return 'PASS';
      if (value <= 2.0) return 'WATCH';
      return 'FAIL';
    case 'peRatio':
      if (value <= 0) return 'WATCH';
      if (value <= 20) return 'PASS';
      if (value <= 30) return 'WATCH';
      return 'FAIL';
    case 'dividendYield':
      if (value >= 3) return 'STRONG';
      if (value >= 2) return 'OK';
      if (value > 0) return 'WATCH';
      return 'N/A';
    default:
      return 'N/A';
  }
}

export function gaugeFraction(def: MetricDef, value: number | null | undefined): number {
  if (value === null || value === undefined || Number.isNaN(value)) return 0;
  const f = Math.abs(value) / def.gaugeMax;
  return Math.max(0, Math.min(1, f));
}

// ---------------------------------------------------------------------------
// Graham intrinsic value: V = EPS * (8.5 + 2g) * 4.4 / Y
// Margin of safety: S = V * 0.65  (buy below ~2/3 of intrinsic value)
// ---------------------------------------------------------------------------
export interface GrahamInputs {
  eps: number;
  growthRatePct: number; // g, as whole percent e.g. 8 for 8%
  aaaYieldPct: number; // Y, current AAA corporate bond yield, whole percent
}

export function grahamIntrinsicValue({ eps, growthRatePct, aaaYieldPct }: GrahamInputs): number {
  if (!eps || !aaaYieldPct) return 0;
  const v = (eps * (8.5 + 2 * growthRatePct) * 4.4) / aaaYieldPct;
  return v;
}

export function marginOfSafetyPrice(intrinsicValue: number): number {
  return intrinsicValue * 0.65;
}

// ---------------------------------------------------------------------------
// Business life cycle (Playbook §7)
// ---------------------------------------------------------------------------
export const LIFECYCLE_STAGES = [
  { id: 1, label: 'Startup', question: 'Can we find product / market fit?' },
  { id: 2, label: 'Hyper Growth', question: 'Is this business sustainable?' },
  { id: 3, label: 'Self-Funding', question: 'Can we scale?' },
  { id: 4, label: 'Operating Leverage', question: 'Can we maximize profits?' },
  { id: 5, label: 'Capital Return', question: 'Can we reward investors?' },
  { id: 6, label: 'Decline', question: 'Can we turn things around?' },
] as const;

// ---------------------------------------------------------------------------
// Moat assessment (Playbook §6)
// ---------------------------------------------------------------------------
export const MOAT_SOURCES = [
  'Network Effect',
  'Switching Costs',
  'Low-Cost Producer',
  'Intangibles',
  'Counter-Positioning',
  'None Identified',
] as const;

export const MOAT_WIDTHS = ['None', 'Narrow', 'Wide'] as const;
export const MOAT_DIRECTIONS = ['Shrinking', 'Stable', 'Widening'] as const;

export interface MoatRow {
  source: (typeof MOAT_SOURCES)[number];
  width: (typeof MOAT_WIDTHS)[number];
  direction: (typeof MOAT_DIRECTIONS)[number];
  note: string;
}

export function defaultMoatRows(): MoatRow[] {
  return [
    { source: 'Low-Cost Producer', width: 'Narrow', direction: 'Stable', note: '' },
    { source: 'Intangibles', width: 'Narrow', direction: 'Stable', note: '' },
    { source: 'Switching Costs', width: 'None', direction: 'Stable', note: '' },
  ];
}

// ---------------------------------------------------------------------------
// Quality-of-earnings red flags (Playbook §5)
// ---------------------------------------------------------------------------
export interface FlagResult {
  id: string;
  title: string;
  reading: string;
  detail: string;
  severity: Grade;
}

export function buildFlags(input: {
  peRatio: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  operatingCashFlow: number | null;
  netIncome: number | null;
  freeCashFlow: number | null;
  dividendYield: number | null;
}): FlagResult[] {
  const flags: FlagResult[] = [];

  // Valuation
  if (input.peRatio !== null) {
    flags.push({
      id: 'valuation',
      title: 'Valuation',
      reading: `${input.peRatio.toFixed(1)}x P/E`,
      detail:
        input.peRatio <= 20
          ? 'Trading inside the Playbook’s < 20x P/E guideline.'
          : 'Above the Playbook’s < 20x P/E guideline — priced for growth or overextended.',
      severity: gradeMetric('peRatio', input.peRatio),
    });
  }

  // Leverage
  if (input.debtToEquity !== null) {
    flags.push({
      id: 'leverage',
      title: 'Leverage',
      reading: `${input.debtToEquity.toFixed(2)}x D/E`,
      detail:
        input.debtToEquity <= 1
          ? 'Debt load sits within the Playbook’s < 1.0x target.'
          : 'Debt/equity exceeds the < 1.0x target — confirm the balance sheet can self-finance in 3-4 years.',
      severity: gradeMetric('debtToEquity', input.debtToEquity),
    });
  }

  // Liquidity
  if (input.currentRatio !== null) {
    flags.push({
      id: 'liquidity',
      title: 'Liquidity',
      reading: `${input.currentRatio.toFixed(2)}x current ratio`,
      detail:
        input.currentRatio >= 1.5
          ? 'Comfortably above the > 1.5x Playbook bar.'
          : 'Below the Playbook’s > 1.5x bar — watch short-term obligations.',
      severity: gradeMetric('currentRatio', input.currentRatio),
    });
  }

  // Cash return / earnings quality: OCF vs Net Income
  if (input.operatingCashFlow !== null && input.netIncome !== null && input.netIncome !== 0) {
    const ok = input.operatingCashFlow > input.netIncome;
    flags.push({
      id: 'cashReturn',
      title: 'Cash Return',
      reading: ok ? 'OCF > NI' : 'OCF < NI',
      detail: ok
        ? 'Operating cash flow exceeds net income — healthy earnings quality per the Playbook rule.'
        : 'Operating cash flow trails net income — a low-quality-earnings flag per the Playbook.',
      severity: ok ? 'PASS' : 'WATCH',
    });
  }

  return flags;
}

// ---------------------------------------------------------------------------
// Auto-generated bull / bear bullet seeds (user can edit before sharing)
// ---------------------------------------------------------------------------
export function buildAutoThesis(input: {
  grossMargin: number | null;
  netMargin: number | null;
  roe: number | null;
  roic: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  peRatio: number | null;
  dividendYield: number | null;
  priceVsIntrinsic: number | null; // price / intrinsic value
}) {
  const bull: string[] = [];
  const bear: string[] = [];

  if (input.grossMargin !== null && input.grossMargin >= 40) bull.push(`Gross margin ~${input.grossMargin.toFixed(0)}% signals real pricing power.`);
  if (input.netMargin !== null && input.netMargin >= 20) bull.push(`Net margin ~${input.netMargin.toFixed(0)}% is durable-advantage territory.`);
  if (input.roe !== null && input.roe >= 20) bull.push(`ROE ~${input.roe.toFixed(0)}% clears the Playbook’s > 20% bar.`);
  if (input.roic !== null && input.roic >= 15) bull.push(`ROIC ~${input.roic.toFixed(0)}% clears the > 15% capital-efficiency bar.`);
  if (input.peRatio !== null && input.peRatio > 0 && input.peRatio <= 20) bull.push(`Trades at ~${input.peRatio.toFixed(1)}x earnings — inside the Playbook’s value zone.`);
  if (input.debtToEquity !== null && input.debtToEquity <= 0.5) bull.push('Low leverage — largely self-financing balance sheet.');
  if (input.dividendYield !== null && input.dividendYield >= 2) bull.push(`~${input.dividendYield.toFixed(1)}% dividend yield adds shareholder return.`);
  if (input.priceVsIntrinsic !== null && input.priceVsIntrinsic <= 0.67) bull.push('Price sits at or below the 2/3-of-intrinsic-value margin of safety.');

  if (input.grossMargin !== null && input.grossMargin < 25) bear.push(`Gross margin ~${input.grossMargin.toFixed(0)}% suggests limited pricing power / commodity exposure.`);
  if (input.currentRatio !== null && input.currentRatio < 1.5) bear.push(`Current ratio ~${input.currentRatio.toFixed(2)}x fails the Playbook’s > 1.5x liquidity bar.`);
  if (input.debtToEquity !== null && input.debtToEquity > 1) bear.push(`Debt/equity ~${input.debtToEquity.toFixed(2)}x is elevated versus the < 1.0x target.`);
  if (input.peRatio !== null && input.peRatio > 25) bear.push(`~${input.peRatio.toFixed(1)}x P/E prices in a lot of future growth.`);
  if (input.roe !== null && input.roe < 15) bear.push(`ROE ~${input.roe.toFixed(0)}% is below the > 15-20% quality bar.`);
  if (input.priceVsIntrinsic !== null && input.priceVsIntrinsic > 1) bear.push('Price sits above the Graham-derived intrinsic value estimate — no margin of safety.');

  return { bull, bear };
}

export function qualityLabel(netMargin: number | null, roe: number | null): string {
  if (netMargin === null || roe === null) return 'UNRATED';
  if (netMargin >= 20 && roe >= 20) return 'HIGH QUALITY';
  if (netMargin >= 10 && roe >= 10) return 'SOLID';
  if (netMargin >= 0) return 'CYCLICAL';
  return 'WEAK';
}

export function priceLabel(priceVsIntrinsic: number | null): string {
  if (priceVsIntrinsic === null) return 'UNRATED';
  if (priceVsIntrinsic <= 0.67) return 'DEEP VALUE';
  if (priceVsIntrinsic <= 0.9) return 'MARGIN OF SAFETY';
  if (priceVsIntrinsic <= 1.1) return 'FAIR VALUE';
  return 'RICH';
}
