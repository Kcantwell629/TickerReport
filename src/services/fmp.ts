// Financial Modeling Prep client.
// FMP migrated its API from the legacy `/api/v3/...` path-param style
// (e.g. /api/v3/profile/AAPL) to the current `/stable/...` query-param
// style (e.g. /stable/profile?symbol=AAPL). Keys issued against the new
// API are rejected by the legacy paths, so this client targets /stable.
// Get a free key at https://site.financialmodelingprep.com/developer/docs/
//
// Some /stable ratio fields were also renamed (e.g. debtEquityRatioTTM ->
// debtToEquityRatioTTM) and ROE/ROIC moved from ratios-ttm to key-metrics-ttm.
// Field lookups below try the current name first, then older/alternate
// names defensively — a miss degrades to null (shown as N/A) rather than
// breaking the report.

const BASE_URL = 'https://financialmodelingprep.com/stable';

export class FmpError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'FmpError';
    this.status = status;
  }
}

async function fmpGet<T>(path: string, params: Record<string, string | number>, apiKey: string): Promise<T> {
  const qs = new URLSearchParams({ ...params, apikey: apiKey } as Record<string, string>);
  const url = `${BASE_URL}${path}?${qs.toString()}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new FmpError('Network request failed. Check your internet connection.');
  }
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new FmpError('API key was rejected. Check the key in Settings.', res.status);
    }
    if (res.status === 429) {
      throw new FmpError('Daily free-tier request limit reached. Try again tomorrow.', res.status);
    }
    if (res.status === 402) {
      throw new FmpError('This endpoint needs a paid Financial Modeling Prep plan — your free-tier key doesn\'t include it.', res.status);
    }
    throw new FmpError(`Data provider returned an error (${res.status}).`, res.status);
  }
  const json = await res.json();
  if (json && typeof json === 'object' && !Array.isArray(json) && 'Error Message' in json) {
    throw new FmpError(String((json as any)['Error Message']));
  }
  return json as T;
}

/** FMP endpoints that historically return an array sometimes now return a bare object. Normalize to one item. */
function firstItem<T>(data: T | T[] | null | undefined): T | null {
  if (!data) return null;
  if (Array.isArray(data)) return data.length > 0 ? data[0] : null;
  return data;
}

/** Read the first present field from a loosely-typed object, trying several candidate names. */
function pick(obj: any, ...keys: string[]): number | null {
  if (!obj) return null;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
  }
  return null;
}

export interface FmpProfile {
  symbol: string;
  companyName: string;
  currency: string;
  exchangeShortName: string;
  industry: string;
  sector: string;
  description: string;
  ceo: string;
  ipoDate: string;
  city: string;
  state: string;
  country: string;
  fullTimeEmployees: string;
  mktCap: number;
  price: number;
  range: string; // "17.45-38.25"
  beta: number;
  lastDiv: number;
  website: string;
  image: string;
}

export interface FmpQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

/** Normalized ratio bundle — insulates the rest of the app from FMP's exact field names. */
export interface NormalizedRatios {
  currentRatioTTM: number | null;
  debtEquityRatioTTM: number | null;
  grossProfitMarginTTM: number | null;
  netProfitMarginTTM: number | null;
  returnOnEquityTTM: number | null;
  returnOnAssetsTTM: number | null;
  priceEarningsRatioTTM: number | null;
  dividendYieldTTM: number | null;
}

export interface NormalizedKeyMetrics {
  roicTTM: number | null;
  returnOnEquityTTM: number | null;
  enterpriseValueTTM: number | null;
  evToEbitdaTTM: number | null;
  freeCashFlowYieldTTM: number | null;
  netDebtToEBITDATTM: number | null;
}

export interface FmpIncomeStatement {
  date: string;
  calendarYear: string;
  revenue: number;
  grossProfit: number;
  netIncome: number;
  eps: number;
  epsdiluted: number;
}

export interface FmpCashFlowStatement {
  date: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
}

export async function fetchProfile(symbol: string, apiKey: string): Promise<FmpProfile> {
  const data = await fmpGet<FmpProfile[] | FmpProfile>('/profile', { symbol }, apiKey);
  const item = firstItem(data);
  if (!item) throw new FmpError(`No company profile found for "${symbol}". Check the ticker.`);
  return item;
}

export async function fetchQuote(symbol: string, apiKey: string): Promise<FmpQuote> {
  const data = await fmpGet<FmpQuote[] | FmpQuote>('/quote', { symbol }, apiKey);
  const item = firstItem(data);
  if (!item) throw new FmpError(`No quote found for "${symbol}".`);
  return item;
}

export async function fetchRatiosTTM(symbol: string, apiKey: string): Promise<NormalizedRatios | null> {
  const data = await fmpGet<any[] | any>('/ratios-ttm', { symbol }, apiKey);
  const item = firstItem(data);
  if (!item) return null;
  return {
    currentRatioTTM: pick(item, 'currentRatioTTM'),
    debtEquityRatioTTM: pick(item, 'debtToEquityRatioTTM', 'debtEquityRatioTTM'),
    grossProfitMarginTTM: pick(item, 'grossProfitMarginTTM'),
    netProfitMarginTTM: pick(item, 'netProfitMarginTTM'),
    returnOnEquityTTM: pick(item, 'returnOnEquityTTM', 'roeTTM'),
    returnOnAssetsTTM: pick(item, 'returnOnAssetsTTM', 'roaTTM'),
    priceEarningsRatioTTM: pick(item, 'priceToEarningsRatioTTM', 'priceEarningsRatioTTM'),
    dividendYieldTTM: pick(item, 'dividendYieldTTM'),
  };
}

export async function fetchKeyMetricsTTM(symbol: string, apiKey: string): Promise<NormalizedKeyMetrics | null> {
  const data = await fmpGet<any[] | any>('/key-metrics-ttm', { symbol }, apiKey);
  const item = firstItem(data);
  if (!item) return null;
  return {
    roicTTM: pick(item, 'roicTTM', 'returnOnInvestedCapitalTTM'),
    returnOnEquityTTM: pick(item, 'returnOnEquityTTM', 'roeTTM'),
    enterpriseValueTTM: pick(item, 'enterpriseValueTTM'),
    evToEbitdaTTM: pick(item, 'evToEbitdaTTM', 'enterpriseValueOverEBITDATTM'),
    freeCashFlowYieldTTM: pick(item, 'freeCashFlowYieldTTM'),
    netDebtToEBITDATTM: pick(item, 'netDebtToEBITDATTM'),
  };
}

export async function fetchIncomeStatements(symbol: string, apiKey: string, limit = 6): Promise<FmpIncomeStatement[]> {
  const data = await fmpGet<FmpIncomeStatement[] | FmpIncomeStatement>(
    '/income-statement',
    { symbol, period: 'annual', limit },
    apiKey
  );
  return Array.isArray(data) ? data : data ? [data] : [];
}

export async function fetchCashFlowStatements(symbol: string, apiKey: string, limit = 1): Promise<FmpCashFlowStatement[]> {
  const data = await fmpGet<FmpCashFlowStatement[] | FmpCashFlowStatement>(
    '/cashflow-statement',
    { symbol, period: 'annual', limit },
    apiKey
  );
  return Array.isArray(data) ? data : data ? [data] : [];
}

/** EPS CAGR over the available trailing years, as a whole percent (e.g. 8 for 8%). */
export function estimateEpsGrowthRate(statements: FmpIncomeStatement[]): number {
  const sorted = [...statements]
    .filter((s) => s.epsdiluted !== null && s.epsdiluted !== undefined)
    .sort((a, b) => a.calendarYear.localeCompare(b.calendarYear));
  if (sorted.length < 2) return 5; // conservative fallback
  const first = sorted[0].epsdiluted;
  const last = sorted[sorted.length - 1].epsdiluted;
  const years = sorted.length - 1;
  if (first <= 0 || last <= 0 || years <= 0) return 5;
  const cagr = (Math.pow(last / first, 1 / years) - 1) * 100;
  // Clamp to a sane range — hyper-growth or negative CAGR breaks the Graham formula
  return Math.max(0, Math.min(20, cagr));
}
