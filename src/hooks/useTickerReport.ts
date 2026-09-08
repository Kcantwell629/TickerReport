import { useCallback, useEffect, useState } from 'react';
import {
  fetchProfile,
  fetchQuote,
  fetchRatiosTTM,
  fetchKeyMetricsTTM,
  fetchIncomeStatements,
  fetchCashFlowStatements,
  estimateEpsGrowthRate,
  FmpError,
} from '../services/fmp';

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

export function useTickerReport(symbol: string, apiKey: string) {
  const [state, setState] = useState<State>({ loading: false, error: null, data: null });

  const run = useCallback(async () => {
    if (!symbol) return;
    if (!apiKey) {
      setState({ loading: false, error: 'Add a free Financial Modeling Prep API key in Settings to pull live data.', data: null });
      return;
    }
    setState({ loading: true, error: null, data: null });
    try {
      const sym = symbol.trim().toUpperCase();
      const [profile, quote, ratios, keyMetrics, incomeStatements, cashFlows] = await Promise.all([
        fetchProfile(sym, apiKey),
        fetchQuote(sym, apiKey),
        fetchRatiosTTM(sym, apiKey).catch(() => null),
        fetchKeyMetricsTTM(sym, apiKey).catch(() => null),
        fetchIncomeStatements(sym, apiKey, 6).catch(() => []),
        fetchCashFlowStatements(sym, apiKey, 1).catch(() => []),
      ]);

      const latestIncome = incomeStatements[0];
      const latestCashFlow = cashFlows[0];

      const data: ReportData = {
        symbol: sym,
        companyName: profile.companyName ?? sym,
        exchange: profile.exchangeShortName ?? '',
        currency: profile.currency ?? 'USD',
        sector: profile.sector ?? '—',
        industry: profile.industry ?? '—',
        description: profile.description ?? '',
        ceo: profile.ceo ?? '—',
        city: profile.city ?? '',
        state: profile.state ?? '',
        country: profile.country ?? '',
        employees: profile.fullTimeEmployees ?? '—',
        ipoDate: profile.ipoDate ?? '—',
        website: profile.website ?? '',
        image: profile.image ?? '',
        beta: typeof profile.beta === 'number' ? profile.beta : null,

        price: quote.price ?? profile.price ?? 0,
        changePercent: quote.changesPercentage ?? 0,
        marketCap: quote.marketCap ?? profile.mktCap ?? 0,
        yearHigh: quote.yearHigh ?? 0,
        yearLow: quote.yearLow ?? 0,
        eps: quote.eps ?? 0,
        peRatio: quote.pe ?? (ratios ? ratios.priceEarningsRatioTTM : null) ?? null,

        grossMargin: pct(ratios?.grossProfitMarginTTM),
        netMargin: pct(ratios?.netProfitMarginTTM),
        // ROE/ROIC live on key-metrics-ttm in FMP's current API; ratios-ttm is a fallback
        // in case a plan/version still surfaces it there.
        roe: pct(keyMetrics?.returnOnEquityTTM ?? ratios?.returnOnEquityTTM),
        roic: pct(keyMetrics?.roicTTM),
        currentRatio: ratios?.currentRatioTTM ?? null,
        debtToEquity: ratios?.debtEquityRatioTTM ?? null,
        dividendYield: pct(ratios?.dividendYieldTTM),

        revenueTTM: latestIncome ? latestIncome.revenue : null,
        netIncomeTTM: latestIncome ? latestIncome.netIncome : null,
        operatingCashFlow: latestCashFlow ? latestCashFlow.operatingCashFlow : null,
        freeCashFlow: latestCashFlow ? latestCashFlow.freeCashFlow : null,
        epsGrowthRatePct: estimateEpsGrowthRate(incomeStatements),
      };

      setState({ loading: false, error: null, data });
    } catch (e) {
      const message = e instanceof FmpError ? e.message : 'Something went wrong fetching this ticker.';
      setState({ loading: false, error: message, data: null });
    }
  }, [symbol, apiKey]);

  return { ...state, run };
}
