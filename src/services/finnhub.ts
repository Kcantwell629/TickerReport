// Finnhub client.
// Alpha Vantage moved its Company Overview endpoint behind a paid plan, which every
// report depended on, so the data layer moved here. Finnhub's free tier (60 requests/min,
// key at https://finnhub.io/register) covers profile, quote and basic financials.
//
// Quirks specific to this API, handled below:
//  - Real HTTP status codes: 401 bad key, 403 not on your plan, 429 rate limited.
//  - An unknown symbol is HTTP 200 with an empty object `{}` rather than an error.
//  - Margins, returns and yields come back as percentages (24.3 means 24.3%), while
//    marketCapitalization and shareOutstanding are in millions.
//  - The key goes in a header, not the query string, so it never lands in a URL or log.

const BASE_URL = 'https://finnhub.io/api/v1';

export class FinnhubError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FinnhubError';
  }
}

async function fhGet<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const url = `${BASE_URL}${path}?${new URLSearchParams(params).toString()}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { 'X-Finnhub-Token': apiKey } });
  } catch {
    throw new FinnhubError('Network request failed. Check your internet connection.');
  }
  if (res.status === 401) throw new FinnhubError("Finnhub doesn't accept this API key. Check it in Settings (no spaces or extra characters).");
  if (res.status === 403) throw new FinnhubError("Your Finnhub plan doesn't include this data (the free tier covers US-listed stocks).");
  if (res.status === 429) throw new FinnhubError('Finnhub rate limit hit (60 requests per minute on the free tier). Wait a moment and retry.');
  if (!res.ok) throw new FinnhubError(`Finnhub returned an error (${res.status}).`);
  return (await res.json()) as T;
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** First metric present from a priority list — Finnhub names the same figure several ways. */
function pick(metric: Record<string, unknown>, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = num(metric[k]);
    if (v !== null) return v;
  }
  return null;
}

/** Finnhub returns full legal names ("NEW YORK STOCK EXCHANGE, INC."); the report header needs the ticker-style label. */
export function shortExchange(name: string): string {
  const n = name.toUpperCase();
  if (n.includes('NASDAQ')) return 'NASDAQ';
  if (n.includes('NYSE ARCA') || n.includes('ARCA')) return 'NYSE ARCA';
  if (n.includes('AMERICAN') || n.includes('NYSE MKT')) return 'NYSE AMERICAN';
  if (n.includes('NEW YORK STOCK EXCHANGE') || n.includes('NYSE')) return 'NYSE';
  if (n.includes('CBOE') || n.includes('BATS')) return 'CBOE';
  return name.length > 14 ? name.slice(0, 14).trim() : name;
}

export interface Profile {
  name: string;
  exchange: string;
  currency: string;
  country: string;
  industry: string;
  ipo: string;
  website: string;
  logo: string;
  marketCap: number | null; // dollars
  sharesOutstanding: number | null; // shares
}

export async function fetchProfile(symbol: string, apiKey: string): Promise<Profile> {
  const d = await fhGet<Record<string, unknown>>('/stock/profile2', { symbol }, apiKey);
  if (!d || !d.ticker) throw new FinnhubError(`No company data found for "${symbol}". Check the ticker (US-listed stocks only).`);
  const cap = num(d.marketCapitalization);
  const shares = num(d.shareOutstanding);
  return {
    name: typeof d.name === 'string' && d.name ? d.name : symbol,
    exchange: typeof d.exchange === 'string' ? shortExchange(d.exchange) : '',
    currency: typeof d.currency === 'string' ? d.currency : 'USD',
    country: typeof d.country === 'string' ? d.country : '',
    industry: typeof d.finnhubIndustry === 'string' && d.finnhubIndustry ? d.finnhubIndustry : '—',
    ipo: typeof d.ipo === 'string' ? d.ipo : '',
    website: typeof d.weburl === 'string' ? d.weburl : '',
    logo: typeof d.logo === 'string' ? d.logo : '',
    marketCap: cap === null ? null : cap * 1e6,
    sharesOutstanding: shares === null ? null : shares * 1e6,
  };
}

export interface Quote {
  price: number | null;
  changePercent: number | null;
}

export async function fetchQuote(symbol: string, apiKey: string): Promise<Quote> {
  const d = await fhGet<Record<string, unknown>>('/quote', { symbol }, apiKey);
  const price = num(d.c);
  // Finnhub answers an unknown/unsupported symbol with all zeros.
  if (price === null || price === 0) return { price: null, changePercent: null };
  return { price, changePercent: num(d.dp) };
}

export interface Metrics {
  week52High: number | null;
  week52Low: number | null;
  beta: number | null;
  eps: number | null;
  peRatio: number | null;
  grossMargin: number | null; // percent
  netMargin: number | null; // percent
  roe: number | null; // percent
  roic: number | null; // percent (Finnhub's return on investment: net income / (debt + equity))
  currentRatio: number | null;
  debtToEquity: number | null; // ratio
  dividendYield: number | null; // percent
  revenuePerShare: number | null;
  cashFlowPerShare: number | null;
  freeCashFlowPerShare: number | null;
  epsGrowthPct: number | null; // best multi-year EPS growth figure available, percent
}

export async function fetchMetrics(symbol: string, apiKey: string): Promise<Metrics> {
  const d = await fhGet<{ metric?: Record<string, unknown> }>('/stock/metric', { symbol, metric: 'all' }, apiKey);
  const m = d.metric ?? {};
  return {
    week52High: pick(m, '52WeekHigh'),
    week52Low: pick(m, '52WeekLow'),
    beta: pick(m, 'beta'),
    eps: pick(m, 'epsTTM', 'epsInclExtraItemsTTM', 'epsExclExtraItemsTTM', 'epsAnnual'),
    peRatio: pick(m, 'peTTM', 'peBasicExclExtraTTM', 'peExclExtraTTM', 'peNormalizedAnnual'),
    grossMargin: pick(m, 'grossMarginTTM', 'grossMarginAnnual'),
    netMargin: pick(m, 'netProfitMarginTTM', 'netProfitMarginAnnual'),
    roe: pick(m, 'roeTTM', 'roeRfy'),
    roic: pick(m, 'roiTTM', 'roiAnnual'),
    currentRatio: pick(m, 'currentRatioQuarterly', 'currentRatioAnnual'),
    debtToEquity: pick(m, 'totalDebt/totalEquityQuarterly', 'totalDebt/totalEquityAnnual'),
    dividendYield: pick(m, 'dividendYieldIndicatedAnnual', 'currentDividendYieldTTM'),
    revenuePerShare: pick(m, 'revenuePerShareTTM', 'revenuePerShareAnnual'),
    cashFlowPerShare: pick(m, 'cashFlowPerShareTTM', 'cashFlowPerShareAnnual'),
    freeCashFlowPerShare: pick(m, 'freeCashFlowPerShareTTM'),
    // A multi-year figure is the right input for Graham's g; the one-quarter YoY is a last resort.
    epsGrowthPct: pick(m, 'epsGrowth5Y', 'epsGrowth3Y', 'epsGrowthTTMYoy', 'epsGrowthQuarterlyYoy'),
  };
}

/**
 * Dual-class stocks (BRK.B) come back with the quote for one share class but per-share metrics
 * (52-week range, EPS, cash flow per share) for another — BRK.B's $515 price next to a
 * $698,000+ 52-week range. A price far outside its own 52-week range can only be that mismatch,
 * so the per-share figures can't be trusted alongside it.
 */
export function isShareClassMismatch(price: number | null, low: number | null, high: number | null): boolean {
  if (price === null || low === null || high === null || low <= 0 || high <= 0) return false;
  return price < low * 0.5 || price > high * 2;
}

/** Cyclical businesses swing wildly with the commodity cycle, so recent growth says little about long-run growth. */
function isCyclical(industry: string): boolean {
  return /energy|\boil\b|materials|mining|metals|steel|chemical|shipping|marine/i.test(industry);
}

const MAX_GROWTH_PCT = 15;
const MAX_CYCLICAL_GROWTH_PCT = 8;

/**
 * Graham's g from a multi-year EPS growth figure, clamped to 0..15% (0..8% for cyclicals, where a
 * rebound off a low base would otherwise read as a long-run growth story). Falls back to 5%.
 */
export function estimateGrowthRatePct(growthPct: number | null, industry: string): number {
  if (growthPct === null) return 5;
  const cap = isCyclical(industry) ? MAX_CYCLICAL_GROWTH_PCT : MAX_GROWTH_PCT;
  return Math.max(0, Math.min(cap, growthPct));
}
