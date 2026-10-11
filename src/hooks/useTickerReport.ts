import { useCallback, useState } from 'react';
import {
  fetchProfile,
  fetchQuote,
  fetchMetrics,
  estimateGrowthRatePct,
  isShareClassMismatch,
  FinnhubError,
} from '../services/finnhub';

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

/** Tags a rejection with which endpoint it came from, so the surfaced error names the culprit. */
async function labeled<T>(label: string, p: Promise<T>): Promise<T> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof FinnhubError) throw new FinnhubError(`[${label}] ${e.message}`);
    throw e;
  }
}

export function useTickerReport(symbol: string, apiKey: string) {
  const [state, setState] = useState<State>({ loading: false, error: null, data: null });

  const run = useCallback(async () => {
    if (!symbol) return;
    if (!apiKey) {
      setState({ loading: false, error: 'Add a free Finnhub API key in Settings to pull live data.', data: null });
      return;
    }
    setState({ loading: true, error: null, data: null });
    try {
      const sym = symbol.trim().toUpperCase();

      const soft = async <T,>(label: string, fallback: T, p: Promise<T>): Promise<T> => {
        try {
          return await p;
        } catch (e) {
          console.warn(`[TickerReport] ${label} unavailable:`, e instanceof FinnhubError ? e.message : e);
          return fallback;
        }
      };
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      // Finnhub's free tier allows 60 requests/min, so the three calls can run together.
      // Only the profile is required; quote and metrics degrade to blanks if they fail.
      const [profile, quote, metrics] = await Promise.all([
        labeled('profile', fetchProfile(sym, apiKey)),
        soft('quote', { price: null, changePercent: null }, fetchQuote(sym, apiKey)),
        soft('metrics', null, fetchMetrics(sym, apiKey)),
      ]);

      // Finnhub gives per-share cash-flow and revenue figures; scale by shares outstanding.
      const m = metrics;
      const shareClassMismatch = isShareClassMismatch(quote.price, m?.week52Low ?? null, m?.week52High ?? null);
      if (shareClassMismatch) {
        console.warn('[TickerReport] price is outside the 52-week range: per-share metrics are for another share class', {
          symbol: sym,
          price: quote.price,
          week52Low: m?.week52Low,
          week52High: m?.week52High,
        });
      }
      const shares = profile.sharesOutstanding;
      const perShare = (v: number | null | undefined) => (!shareClassMismatch && v != null && shares ? v * shares : null);
      // P/E is class-consistent, so price / P/E recovers an EPS that matches the quoted price.
      const eps = shareClassMismatch
        ? quote.price && m?.peRatio && m.peRatio > 0
          ? quote.price / m.peRatio
          : 0
        : m?.eps ?? 0;

      console.warn('[TickerReport] metrics →', {
        symbol: sym,
        industry: profile.industry,
        marketCap: profile.marketCap,
        eps: m?.eps,
        pe: m?.peRatio,
        grossMargin: m?.grossMargin,
        netMargin: m?.netMargin,
        roe: m?.roe,
        roic: m?.roic,
        currentRatio: m?.currentRatio,
        debtToEquity: m?.debtToEquity,
        dividendYield: m?.dividendYield,
        epsGrowthPct: m?.epsGrowthPct,
      });

      const data: ReportData = {
        symbol: sym,
        companyName: profile.name,
        exchange: profile.exchange,
        currency: profile.currency,
        sector: profile.industry, // Finnhub only classifies by industry
        industry: profile.industry,
        description: '', // not on Finnhub's free profile
        ceo: '—',
        city: '',
        state: '',
        country: profile.country,
        employees: '—',
        ipoDate: profile.ipo || '—',
        website: profile.website,
        image: profile.logo,
        beta: m?.beta ?? null,

        price: quote.price ?? 0,
        changePercent: quote.changePercent ?? 0,
        marketCap: profile.marketCap ?? 0,
        yearHigh: shareClassMismatch ? 0 : m?.week52High ?? 0,
        yearLow: shareClassMismatch ? 0 : m?.week52Low ?? 0,
        eps,
        peRatio: m?.peRatio ?? null,

        grossMargin: m?.grossMargin ?? null,
        netMargin: m?.netMargin ?? null,
        roe: m?.roe ?? null,
        roic: m?.roic ?? null,
        currentRatio: m?.currentRatio ?? null,
        debtToEquity: m?.debtToEquity ?? null,
        dividendYield: m?.dividendYield ?? null,

        revenueTTM: perShare(m?.revenuePerShare),
        netIncomeTTM: perShare(m?.eps), // EPS x shares outstanding: an approximation of TTM net income
        operatingCashFlow: perShare(m?.cashFlowPerShare),
        freeCashFlow: perShare(m?.freeCashFlowPerShare),
        epsGrowthRatePct: estimateGrowthRatePct(m?.epsGrowthPct ?? null, profile.industry),
      };

      setState({ loading: false, error: null, data });
    } catch (e) {
      const message = e instanceof FinnhubError ? e.message : 'Something went wrong fetching this ticker.';
      setState({ loading: false, error: message, data: null });
    }
  }, [symbol, apiKey]);

  return { ...state, run };
}
