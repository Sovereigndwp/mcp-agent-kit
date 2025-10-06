import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { httpClient, coingeckoClient, coinmarketcapClient } from '../utils/http.js';
import { getExchangeRate } from './fx_rate.js';
import { logger } from '../utils/logger.js';

type FallbackPrice = { usd: number; cop: number };

export interface BitcoinSupply {
  circulating?: number | null;
  total?: number | null;
  max?: number | null;
}

export interface BitcoinPriceSnapshot {
  usd: number;
  cop: number;
  eur?: number;
  gbp?: number;
  cad?: number;
  jpy?: number;
  conversions: Record<string, number>;
  change24h?: number;
  change24hPercent?: number;
  high24h?: number;
  low24h?: number;
  marketCap?: number;
  volume24h?: number;
  marketCapRank?: number;
  supply?: BitcoinSupply;
  lastUpdated?: string;
  timestamp: number;
  source: string;
}

const CACHE_PATH = 'exports/cache/btc_price.json';
const SUPPORTED_CONVERSIONS = ['usd', 'eur', 'gbp', 'cad', 'jpy', 'cop'] as const;

type SupportedConversion = (typeof SUPPORTED_CONVERSIONS)[number];

type CoinGeckoMarketResponse = Array<{
  current_price: number;
  price_change_percentage_24h: number | null;
  price_change_24h: number | null;
  high_24h: number | null;
  low_24h: number | null;
  market_cap: number | null;
  total_volume: number | null;
  market_cap_rank: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  last_updated: string;
}>;

type CoinGeckoSimpleResponse = {
  bitcoin?: Record<string, number | undefined> & { last_updated_at?: number };
};

async function tryCoinpaprika(): Promise<number> {
  const r = await httpClient.get<{ quotes: { USD: { price: number } } }>('https://api.coinpaprika.com/v1/tickers/btc-bitcoin');
  return r.quotes.USD.price;
}

async function tryBinance(): Promise<number> {
  const r = await httpClient.get<{ price: string }>('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
  return Number(r.price);
}

async function tryBitstamp(): Promise<number> {
  const r = await httpClient.get<{ last: string }>('https://www.bitstamp.net/api/v2/ticker/btcusd/');
  return Number(r.last);
}

async function tryKraken(): Promise<number> {
  const r = await httpClient.get<{ result: Record<string, { c: [string, string] }> }>('https://api.kraken.com/0/public/Ticker?pair=XBTUSD');
  const key = Object.keys(r.result)[0];
  return Number(r.result[key].c[0]);
}

function saveCache(price: BitcoinPriceSnapshot): void {
  mkdirSync('exports/cache', { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(price, null, 2));
}

function loadCache(): BitcoinPriceSnapshot | null {
  try {
    if (!existsSync(CACHE_PATH)) return null;
    const parsed = JSON.parse(readFileSync(CACHE_PATH, 'utf8')) as BitcoinPriceSnapshot;
    // accept cache up to 10 minutes old
    if (parsed?.timestamp && Date.now() - parsed.timestamp < 10 * 60 * 1000) {
      return parsed;
    }
    return null;
  } catch (error) {
    logger.warn('Failed to load BTC price cache, ignoring', error);
    return null;
  }
}

async function fetchCoinMarketCapSnapshot(): Promise<BitcoinPriceSnapshot> {
  if (!process.env.COINMARKETCAP_API_KEY) {
    throw new Error('CoinMarketCap API key not configured');
  }

  const convert = SUPPORTED_CONVERSIONS.join(',');
  const response = await coinmarketcapClient.get<{ data: Record<string, any> }>(
    `/v1/cryptocurrency/quotes/latest?symbol=BTC&convert=${convert}`
  );

  const btc = response?.data?.BTC;
  if (!btc || !btc.quote) {
    throw new Error('CoinMarketCap returned incomplete data for BTC');
  }

  const conversions: Record<string, number> = {};
  SUPPORTED_CONVERSIONS.forEach(code => {
    const quote = btc.quote[code.toUpperCase()];
    if (quote && typeof quote.price === 'number') {
      conversions[code.toUpperCase()] = quote.price;
    }
  });

  const usdQuote = btc.quote.USD;
  if (!usdQuote) {
    throw new Error('CoinMarketCap USD quote missing');
  }

  const snapshot: BitcoinPriceSnapshot = {
    usd: usdQuote.price,
    cop: conversions.COP ?? usdQuote.price,
    eur: conversions.EUR,
    gbp: conversions.GBP,
    cad: conversions.CAD,
    jpy: conversions.JPY,
    conversions,
    change24hPercent: usdQuote.percent_change_24h ?? undefined,
    change24h: usdQuote.price * ((usdQuote.percent_change_24h ?? 0) / 100),
    high24h: usdQuote.high_24h ?? undefined,
    low24h: usdQuote.low_24h ?? undefined,
    marketCap: usdQuote.market_cap ?? undefined,
    volume24h: usdQuote.volume_24h ?? undefined,
    marketCapRank: btc.cmc_rank ?? undefined,
    supply: {
      circulating: btc.circulating_supply ?? undefined,
      total: btc.total_supply ?? undefined,
      max: btc.max_supply ?? undefined
    },
    lastUpdated: usdQuote.last_updated,
    timestamp: Date.now(),
    source: 'CoinMarketCap'
  };

  return snapshot;
}

async function fetchCoinGeckoSnapshot(): Promise<BitcoinPriceSnapshot> {
  const marketData = await coingeckoClient.get<CoinGeckoMarketResponse>(
    'coins/markets?vs_currency=usd&ids=bitcoin&sparkline=false&price_change_percentage=24h'
  );

  const market = marketData?.[0];
  if (!market) {
    throw new Error('CoinGecko returned no market data for bitcoin');
  }

  const simpleResponse = await coingeckoClient.get<CoinGeckoSimpleResponse>(
    `simple/price?ids=bitcoin&vs_currencies=${SUPPORTED_CONVERSIONS.join(',')}&include_24hr_change=true&include_last_updated_at=true`
  );

  const conversionsRaw = simpleResponse.bitcoin || {};
  const conversions: Record<string, number> = {};

  SUPPORTED_CONVERSIONS.forEach(code => {
    const value = conversionsRaw[code];
    if (typeof value === 'number' && Number.isFinite(value)) {
      conversions[code.toUpperCase()] = value;
    }
  });

  const usdPrice = conversions.USD ?? market.current_price;
  const copPrice = conversions.COP ?? usdPrice;

  const snapshot: BitcoinPriceSnapshot = {
    usd: usdPrice,
    cop: copPrice,
    eur: conversions.EUR,
    gbp: conversions.GBP,
    cad: conversions.CAD,
    jpy: conversions.JPY,
    conversions,
    change24hPercent: market.price_change_percentage_24h ?? undefined,
    change24h: market.price_change_24h ?? undefined,
    high24h: market.high_24h ?? undefined,
    low24h: market.low_24h ?? undefined,
    marketCap: market.market_cap ?? undefined,
    volume24h: market.total_volume ?? undefined,
    marketCapRank: market.market_cap_rank ?? undefined,
    supply: {
      circulating: market.circulating_supply ?? undefined,
      total: market.total_supply ?? undefined,
      max: market.max_supply ?? undefined,
    },
    lastUpdated: market.last_updated,
    timestamp: Date.now(),
    source: 'CoinGecko'
  };

  return snapshot;
}

async function fetchFallbackPrice(): Promise<BitcoinPriceSnapshot> {
  const attempts: Array<() => Promise<number>> = [
    tryCoinpaprika,
    tryBinance,
    tryBitstamp,
    tryKraken,
  ];

  let usd = 0;
  let lastErr: unknown;

  for (const fn of attempts) {
    try {
      usd = await fn();
      if (usd > 0) break;
    } catch (error) {
      lastErr = error;
    }
  }

  if (usd <= 0) {
    throw new Error('All fallback BTC price sources failed' + (lastErr ? `: ${String((lastErr as any)?.message ?? lastErr)}` : ''));
  }

  let cop = usd;
  try {
    const exchangeRate = await getExchangeRate('usd', 'cop');
    cop = usd * exchangeRate.rate;
  } catch (error) {
    logger.warn('Failed to convert USD to COP for fallback price', error);
  }

  const conversions: Record<string, number> = {
    USD: usd,
  };
  if (Number.isFinite(cop)) {
    conversions.COP = cop;
  }

  return {
    usd,
    cop,
    conversions,
    timestamp: Date.now(),
    source: 'Fallback multi-source'
  };
}

export async function btc_price(): Promise<BitcoinPriceSnapshot> {
  const cached = loadCache();
  if (cached) {
    return cached;
  }

  try {
    if (process.env.COINMARKETCAP_API_KEY) {
      const snapshot = await fetchCoinMarketCapSnapshot();
      saveCache(snapshot);
      return snapshot;
    }
  } catch (error) {
    logger.warn('Primary CoinMarketCap price fetch failed, attempting CoinGecko', error);
  }

  try {
    const snapshot = await fetchCoinGeckoSnapshot();
    saveCache(snapshot);
    return snapshot;
  } catch (error) {
    logger.warn('Primary CoinGecko price fetch failed, attempting fallback', error);
  }

  const fallback = await fetchFallbackPrice();
  saveCache(fallback);
  return fallback;
}

export const bitcoinPriceTool = {
  name: 'bitcoin_price',
  description: 'Get current Bitcoin price with market context',
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  },
  handler: async () => {
    const price = await btc_price();
    return {
      price: price.usd,
      currency: 'usd',
      conversions: price.conversions,
      market: {
        change24hPercent: price.change24hPercent,
        change24h: price.change24hPercent,
        change24hValue: price.change24h,
        high24h: price.high24h,
        low24h: price.low24h,
        marketCap: price.marketCap,
        volume24h: price.volume24h,
        marketCapRank: price.marketCapRank,
        supply: price.supply,
      },
      timestamp: price.timestamp,
      source: price.source
    };
  },
  getBitcoinPrice: async () => {
    const price = await btc_price();
    return price.usd;
  },
  getBitcoinPriceDetails: async () => {
    const price = await btc_price();
    return {
      price: price.usd,
      currency: 'usd',
      cop_price: price.cop,
      conversions: price.conversions,
      change24hPercent: price.change24hPercent,
      change24h: price.change24hPercent,
      change24hValue: price.change24h,
      high24h: price.high24h,
      low24h: price.low24h,
      marketCap: price.marketCap,
      volume24h: price.volume24h,
      marketCapRank: price.marketCapRank,
      supply: price.supply,
      timestamp: price.timestamp,
      source: price.source
    };
  }
};

export type BitcoinPriceTool = typeof bitcoinPriceTool;
