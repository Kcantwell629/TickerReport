// Alpha Vantage client.
// FMP's free tier turned out to only cover company profile data — every
// ratio/statement endpoint needed a paid plan (402). Alpha Vantage's free
// tier (25 requests/day, 5/min — get a key at https://www.alphavantage.co/support/#api-key)
// genuinely includes fundamentals, so the whole data layer moved here.
//
// Quirks specific to this API, handled below:
//  - Always returns HTTP 200, even on rate-limit / bad key / bad symbol.
//    Real failures show up as an "Information", "Note", or "Error Message"
//    key in an otherwise-empty JSON body — there's no status code to check.
//  - Every numeric field is a string, and missing values are the literal
//    string "None" rather than null/omitted.

const BASE_URL = 'https://www.alphavantage.co/query';

export class AlphaVantageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlphaVantageError';
  }
}

async function avGet<T extends Record<string, unknown>>(params: Record<string, string>, apiKey: string): Promise<T> {
  const qs = new URLSearchParams({ ...params, apikey: apiKey });
  const url = `${BASE_URL}?${qs.toString()}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new AlphaVantageError('Network request failed. Check your internet connection.');
  }
  if (!res.ok) {
    throw new AlphaVantageError(`Data provider returned an error (${res.status}).`);
  }
  const json = (await res.json()) as Record<string, unknown>;
  if (json['Error Message']) throw new AlphaVantageError(String(json['Error Message']));
  if (json['Note']) throw new AlphaVantageError('Alpha Vantage rate limit hit (5/min or 25/day on the free tier). Wait a bit and retry.');
  if (json['Information']) throw new AlphaVantageError(String(json['Information']));
  return json as T;
}

/** Alpha Vantage represents every number as a string, and "None" for missing. */
function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isNaN(v) ? null : v;
  if (typeof v !== 'string' || v === 'None' || v === '-' || v === '') return null;
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
}

export interface Overview {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  currency: string;
  country: string;
  sector: string;
  industry: string;
  marketCap: number | null;
  beta: number | null;
  peRatio: number | null;
  eps: number | null;
  profitMargin: number | null; // ratio, e.g. 0.21 for 21%
  returnOnEquityTTM: number | null; // ratio
  returnOnAssetsTTM: number | null; // ratio
  dividendYield: number | null; // ratio
  revenueTTM: number | null;
  grossProfitTTM: number | null;
  quarterlyEarningsGrowthYOY: number | null; // ratio
  week52High: number | null;
  week52Low: number | null;
}

export async function fetchOverview(symbol: string, apiKey: string): Promise<Overview> {
  const data = await avGet<Record<string, string>>({ function: 'OVERVIEW', symbol }, apiKey);
  if (!data || !data.Symbol) throw new AlphaVantageError(`No company data found for "${symbol}". Check the ticker.`);
  return {
    symbol: data.Symbol,
    name: data.Name ?? symbol,
    description: data.Description ?? '',
    exchange: data.Exchange ?? '',
    currency: data.Currency ?? 'USD',
    country: data.Country ?? '',
    sector: data.Sector ?? '—',
    industry: data.Industry ?? '—',
    marketCap: num(data.MarketCapitalization),
    beta: num(data.Beta),
    peRatio: num(data.PERatio),
    eps: num(data.EPS),
    profitMargin: num(data.ProfitMargin),
    returnOnEquityTTM: num(data.ReturnOnEquityTTM),
    returnOnAssetsTTM: num(data.ReturnOnAssetsTTM),
    dividendYield: num(data.DividendYield),
    revenueTTM: num(data.RevenueTTM),
    grossProfitTTM: num(data.GrossProfitTTM),
    quarterlyEarningsGrowthYOY: num(data.QuarterlyEarningsGrowthYOY),
    week52High: num(data['52WeekHigh']),
    week52Low: num(data['52WeekLow']),
  };
}

export interface Quote {
  price: number | null;
  changePercent: number | null;
}

export async function fetchQuote(symbol: string, apiKey: string): Promise<Quote> {
  const data = await avGet<{ 'Global Quote'?: Record<string, string> }>({ function: 'GLOBAL_QUOTE', symbol }, apiKey);
  const gq = data['Global Quote'];
  if (!gq || !gq['05. price']) return { price: null, changePercent: null };
  const changePct = gq['10. change percent'] ? parseFloat(gq['10. change percent'].replace('%', '')) : null;
  return {
    price: num(gq['05. price']),
    changePercent: Number.isNaN(changePct) ? null : changePct,
  };
}

export interface BalanceSheet {
  totalCurrentAssets: number | null;
  totalCurrentLiabilities: number | null;
  totalLiabilities: number | null;
  totalShareholderEquity: number | null;
  shortLongTermDebtTotal: number | null;
}

export async function fetchBalanceSheet(symbol: string, apiKey: string): Promise<BalanceSheet | null> {
  const data = await avGet<{ annualReports?: Record<string, string>[] }>({ function: 'BALANCE_SHEET', symbol }, apiKey);
  const latest = data.annualReports?.[0];
  if (!latest) return null;
  return {
    totalCurrentAssets: num(latest.totalCurrentAssets),
    totalCurrentLiabilities: num(latest.totalCurrentLiabilities),
    totalLiabilities: num(latest.totalLiabilities),
    totalShareholderEquity: num(latest.totalShareholderEquity),
    shortLongTermDebtTotal: num(latest.shortLongTermDebtTotal),
  };
}

export interface CashFlow {
  operatingCashflow: number | null;
  capitalExpenditures: number | null;
  netIncome: number | null;
}

export async function fetchCashFlow(symbol: string, apiKey: string): Promise<CashFlow | null> {
  const data = await avGet<{ annualReports?: Record<string, string>[] }>({ function: 'CASH_FLOW', symbol }, apiKey);
  const latest = data.annualReports?.[0];
  if (!latest) return null;
  return {
    operatingCashflow: num(latest.operatingCashflow),
    capitalExpenditures: num(latest.capitalExpenditures),
    netIncome: num(latest.netIncome),
  };
}

/** Quarterly YoY earnings growth is the closest free single-call proxy for Graham's 5yr growth rate g. */
export function estimateGrowthRatePct(overview: Overview): number {
  const g = overview.quarterlyEarningsGrowthYOY;
  if (g === null) return 5; // conservative fallback
  return Math.max(0, Math.min(20, g * 100));
}
