// src/tools/btc_price.ts
import { getJson } from '../utils/http.js';
import { fx_rate } from './fx_rate.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

type Price = { usd: number; cop: number };

async function tryCoinpaprika(): Promise<number> {
  // No key needed
  const r = await getJson<{ quotes: { USD: { price: number } } }>('https://api.coinpaprika.com/v1/tickers/btc-bitcoin');
  return r.quotes.USD.price;
}

async function tryBinance(): Promise<number> {
  // BTC/USDT ~ USD
  const r = await getJson<{ price: string }>('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
  return Number(r.price);
}

async function tryBitstamp(): Promise<number> {
  const r = await getJson<{ last: string }>('https://www.bitstamp.net/api/v2/ticker/btcusd/');
  return Number(r.last);
}

async function tryKraken(): Promise<number> {
  const r = await getJson<{ result: Record<string, { c: [string, string] }> }>('https://api.kraken.com/0/public/Ticker?pair=XBTUSD');
  const key = Object.keys(r.result)[0];
  return Number(r.result[key].c[0]);
}

function saveCache(p: Price) {
  mkdirSync('exports/cache', { recursive: true });
  writeFileSync('exports/cache/btc_price.json', JSON.stringify({ ...p, ts: Date.now() }, null, 2));
}

function loadCache(): Price | null {
  try {
    if (!existsSync('exports/cache/btc_price.json')) return null;
    const j = JSON.parse(readFileSync('exports/cache/btc_price.json','utf8'));
    // accept cache up to 6 hours old
    if (Date.now() - (j.ts ?? 0) < 6 * 60 * 60 * 1000) return { usd: j.usd, cop: j.cop };
    return null;
  } catch { return null; }
}

export async function btc_price(): Promise<Price> {
  // 1) Try cache first (prevents breaking on 429s)
  const cached = loadCache();
  if (cached) return cached;

  // 2) Try multiple sources in order
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
    } catch (e) {
      lastErr = e;
    }
  }

  if (usd <= 0) {
    // If everything failed but we have any cache, return it; else throw
    if (cached) return cached;
    throw new Error('All BTC price sources failed' + (lastErr ? `: ${String((lastErr as any)?.message ?? lastErr)}` : ''));
  }

  // 3) Get USD->COP and build the final object
  const rates = await fx_rate('USD', 'COP'); // exchangerate.host (no key)
  const cop = usd * (rates?.COP ?? 0);

  const out = { usd, cop };
  saveCache(out);
  return out;
}