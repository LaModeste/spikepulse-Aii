// ─────────────────────────────────────────────
// lib/coingecko.ts — CoinGecko API helpers
// Free tier: ~10-30 req/min, no key needed.
// Add COINGECKO_API_KEY to .env.local for Pro.
// ─────────────────────────────────────────────

import type { CoinMarket } from "@/types";

const BASE_URL = process.env.COINGECKO_API_KEY
  ? "https://pro-api.coingecko.com/api/v3"
  : "https://api.coingecko.com/api/v3";

const HEADERS: HeadersInit = process.env.COINGECKO_API_KEY
  ? { "x-cg-pro-api-key": process.env.COINGECKO_API_KEY }
  : {};

const COIN_LIMIT = Number(process.env.NEXT_PUBLIC_COIN_LIMIT ?? 150);

/**
 * Fetch top N coins by market cap with sparkline + multi-timeframe % changes.
 * CoinGecko /coins/markets endpoint.
 *
 * We fetch in pages of 100 (API max per page).
 */
export async function fetchTopCoins(): Promise<CoinMarket[]> {
  const pages = Math.ceil(COIN_LIMIT / 100);
  const requests = Array.from({ length: pages }, (_, i) =>
    fetchPage(i + 1, Math.min(100, COIN_LIMIT - i * 100))
  );

  const results = await Promise.all(requests);
  return results.flat().slice(0, COIN_LIMIT);
}

async function fetchPage(page: number, perPage: number): Promise<CoinMarket[]> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: String(perPage),
    page: String(page),
    sparkline: "true",           // includes 7d hourly sparkline for vol calc
    price_change_percentage: "1h,24h,7d", // multi-timeframe changes
  });

  const url = `${BASE_URL}/coins/markets?${params}`;

  const res = await fetch(url, {
    headers: HEADERS,
    // Next.js 15 cache: revalidate every 4 minutes server-side
    next: { revalidate: 240 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CoinGecko API error ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

/**
 * Simple rate-limit-aware wrapper: retry once after 2s on 429.
 * Useful when called from API routes that might get hammered.
 */
export async function fetchTopCoinsWithRetry(): Promise<CoinMarket[]> {
  try {
    return await fetchTopCoins();
  } catch (err) {
    if (err instanceof Error && err.message.includes("429")) {
      await new Promise((r) => setTimeout(r, 2000));
      return fetchTopCoins();
    }
    throw err;
  }
}
