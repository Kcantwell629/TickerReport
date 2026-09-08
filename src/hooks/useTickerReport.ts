import { useCallback, useState } from 'react';
import {
  fetchOverview,
  fetchQuote,
  fetchBalanceSheet,
  fetchCashFlow,
  estimateGrowthRatePct,
  AlphaVantageError,
} from '../services/alphaVantage';

export interface ReportData {
  symbol: string;
  companyName: string;
  exchange: string;
  currency: string;
  sector: string;
  industry: string;
  description: string;
  ceo: string;
  city: string;
  state: string;
  country: string;
  employees: string;
  ipoDate: string;
  website: string;
  image: string;
  beta: number | null;

  price: number;
  changePercent: number;
  marketCap: number;
  yearHigh: number;
  yearLow: number;
  eps: number;
  peRatio: number | null;

  grossMargin: number | null;
  netMargin: number | null;
  roe: number | null;
  roic: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  dividendYield: number | null;

  revenueTTM: number | null;
  netIncomeTTM: number | null;
  operatingCashFlow: number | null;
  freeCashFlow: number | null;
  epsGrowthRatePct: number;
}

interface State {
  loading: boolean;
  error: string | null;
  data: ReportData | null;
}

/** value*100 unless null/undefined, in which case stays null (never coerces to 0). */
function pct(value: number | null | undefined): number | null {
  return value === null || value === undefined ? null : value * 100;
}

/** Tags a rejection with which endpoint it came from, so the surfaced error names the culprit. */
async function labeled<T>(label: string, p: Promise<T>): Promise<T> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof AlphaVantageError) throw new AlphaVantageError(`[${label}] ${e.message}`);
    throw e;
  }
}

export function useTickerReport(symbol: string, apiKey: string) {
  const [state, setState] = useState<State>({ loading: false, error: null, data: null });

  const run = useCallback(async () => {
    if (!symbol) return;
    if (!apiKey) {
      setState({ loading: false, error: 'Add a free Alpha Vantage API key in Settings to pull live data.', data: null });
      return;
    }
    setState({ loading: true, error: null, data: null });
    try {
      const sym = symbol.trim().toUpperCase();

      const soft = <T,>(label: string, fallback: T, p: Promise<T>): Promise<T> =>
        p.catch((e) => {
          console.warn(`[TickerReport] ${label} unavailable:`, e instanceof AlphaVantageError ? e.message : e);
          return fallback;
        });

      const [overview, quote, balanceSheet, cashFlow] = await Promise.all([
        labeled('overview', fetchOverview(sym, apiKey)),
        soft('quote', { price: null, changePercent: null }, fetchQuote(sym, apiKey)),
        soft('balance-sheet', null, fetchBalanceSheet(sym, apiKey)),
        soft('cash-flow', null, fetchCashFlow(sym, apiKey)),
      ]);

      const currentRatio =
        balanceSheet?.totalCurrentAssets != null && balanceSheet?.totalCurrentLiabilities
          ? balanceSheet.totalCurrentAssets / balanceSheet.totalCurrentLiabilities
          : null;
      const debtToEquity =
        balanceSheet?.totalLiabilities != null && balanceSheet?.totalShareholderEquity
          ? balanceSheet.totalLiabilities / balanceSheet.totalShareholderEquity
          : null;
      // No NOPAT/invested-capital breakdown on the free tier — approximate ROIC as
      // net income over (equity + total debt). A guideline figure, not exact.
      const investedCapital =
        balanceSheet?.totalShareholderEquity != null
          ? balanceSheet.totalShareholderEquity + (balanceSheet.shortLongTermDebtTotal ?? 0)
          : null;
      const roic =
        investedCapital && investedCapital > 0 && cashFlow?.netIncome != null
          ? (cashFlow.netIncome / investedCapital) * 100
          : null;
      const freeCashFlow =
        cashFlow?.operatingCashflow != null && cashFlow?.capitalExpenditures != null
          ? cashFlow.operatingCashflow - cashFlow.capitalExpenditures
          : null;
      const grossMargin =
        overview.grossProfitTTM != null && overview.revenueTTM
          ? (overview.grossProfitTTM / overview.revenueTTM) * 100
          : null;

      const data: ReportData = {
        symbol: sym,
        companyName: overview.name ?? sym,
        exchange: overview.exchange ?? '',
        currency: overview.currency ?? 'USD',
        sector: overview.sector ?? '—',
        industry: overview.industry ?? '—',
        description: overview.description ?? '',
        ceo: '—', // not available from Alpha Vantage's free OVERVIEW endpoint
        city: '',
        state: '',
        country: overview.country ?? '',
        employees: '—', // not available from Alpha Vantage's free OVERVIEW endpoint
        ipoDate: '—',
        website: '',
        image: '',
        beta: overview.beta,

        price: quote.price ?? 0,
        changePercent: quote.changePercent ?? 0,
        marketCap: overview.marketCap ?? 0,
        yearHigh: overview.week52High ?? 0,
        yearLow: overview.week52Low ?? 0,
        eps: overview.eps ?? 0,
        peRatio: overview.peRatio,

        grossMargin,
        netMargin: pct(overview.profitMargin),
        roe: pct(overview.returnOnEquityTTM),
        roic,
        currentRatio,
        debtToEquity,
        dividendYield: pct(overview.dividendYield),

        revenueTTM: overview.revenueTTM,
        netIncomeTTM: cashFlow?.netIncome ?? null,
        operatingCashFlow: cashFlow?.operatingCashflow ?? null,
        freeCashFlow,
        epsGrowthRatePct: estimateGrowthRatePct(overview),
      };

      setState({ loading: false, error: null, data });
    } catch (e) {
      const message = e instanceof AlphaVantageError ? e.message : 'Something went wrong fetching this ticker.';
      setState({ loading: false, error: message, data: null });
    }
  }, [symbol, apiKey]);

  return { ...state, run };
}
