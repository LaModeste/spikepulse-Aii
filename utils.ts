// ─────────────────────────────────────────────
// lib/utils.ts — Shared utility functions
// ─────────────────────────────────────────────

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  CoinMarket,
  SpikeEntry,
  VolatilityEntry,
  MarketSnapshot,
} from "@/types";

// ── Tailwind class merger ──────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Number Formatters ─────────────────────────

export function formatPrice(n: number): string {
  if (n >= 1) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(8)}`;
}

export function formatVolume(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

export function formatPct(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function formatStdDev(n: number): string {
  return `${(n * 100).toFixed(3)}%`;
}

// ── Statistical Helpers ───────────────────────

/** Compute standard deviation of an array of numbers */
export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Convert array of prices → array of log returns */
export function logReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }
  return returns;
}

// ── Data Processing ───────────────────────────

/**
 * Transform raw CoinGecko market data → SpikeEntry[]
 * Sorted by absolute 1h change descending by default.
 * The sparkline has 168 hourly prices (7d × 24h).
 */
export function processSpikes(coins: CoinMarket[]): SpikeEntry[] {
  return coins
    .map((coin) => {
      const spark = coin.sparkline_in_7d?.price ?? [];

      // Estimate 4h change: compare current vs price 4 candles ago in sparkline
      const len = spark.length;
      const change_4h =
        len >= 5 && spark[len - 5] > 0
          ? ((spark[len - 1] - spark[len - 5]) / spark[len - 5]) * 100
          : null;

      // Estimate 15m: use the last two hourly prices as a rough proxy
      // (CoinGecko free tier doesn't give sub-hourly granularity)
      const change_15m =
        len >= 2 && spark[len - 2] > 0
          ? ((spark[len - 1] - spark[len - 2]) / spark[len - 2]) * 100 * 0.25
          : null;

      return {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        price: coin.current_price,
        change_15m,
        change_1h: coin.price_change_percentage_1h_in_currency ?? null,
        change_4h,
        change_24h: coin.price_change_percentage_24h_in_currency ?? null,
        volume24h: coin.total_volume,
        rank: coin.market_cap_rank,
      } satisfies SpikeEntry;
    })
    .sort((a, b) => Math.abs(b.change_1h ?? 0) - Math.abs(a.change_1h ?? 0));
}

/**
 * Transform raw CoinGecko market data → VolatilityEntry[]
 * Uses sparkline (7d hourly) to compute rolling stddev.
 * Sorted by 24h stddev descending.
 */
export function processVolatility(coins: CoinMarket[]): VolatilityEntry[] {
  return coins
    .map((coin) => {
      const spark = coin.sparkline_in_7d?.price ?? [];
      const allReturns = logReturns(spark);

      // Last 24 hourly returns = last 24 values
      const returns_24h = allReturns.slice(-24);
      const stddev_24h = stdDev(returns_24h);
      const stddev_7d = stdDev(allReturns);
      const avg_return_24h =
        returns_24h.length > 0
          ? returns_24h.reduce((a, b) => a + b, 0) / returns_24h.length
          : 0;

      return {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        price: coin.current_price,
        stddev_24h,
        stddev_7d,
        avg_return_24h,
        rank: coin.market_cap_rank,
      } satisfies VolatilityEntry;
    })
    .sort((a, b) => b.stddev_24h - a.stddev_24h);
}

/**
 * Build a market snapshot object to inject into AI chat context.
 * Passes top 10 spikes + top 10 volatility leaders to keep prompt short.
 */
export function buildMarketSnapshot(
  spikes: SpikeEntry[],
  volatility: VolatilityEntry[],
  totalCoins: number
): MarketSnapshot {
  return {
    topSpikes: spikes.slice(0, 10),
    volatilityLeaders: volatility.slice(0, 10),
    fetchedAt: new Date().toISOString(),
    totalCoins,
  };
}

/** Format a MarketSnapshot as a readable string for the AI system prompt */
export function snapshotToPrompt(snap: MarketSnapshot): string {
  const spikes = snap.topSpikes
    .map(
      (s, i) =>
        `${i + 1}. ${s.symbol} (${s.name}): 1h=${formatPct(s.change_1h)} 4h=${formatPct(s.change_4h)} 24h=${formatPct(s.change_24h)} price=${formatPrice(s.price)} vol=${formatVolume(s.volume24h)}`
    )
    .join("\n");

  const vols = snap.volatilityLeaders
    .map(
      (v, i) =>
        `${i + 1}. ${v.symbol} (${v.name}): σ24h=${formatStdDev(v.stddev_24h)} σ7d=${formatStdDev(v.stddev_7d)} price=${formatPrice(v.price)}`
    )
    .join("\n");

  return `=== MARKET SNAPSHOT (${new Date(snap.fetchedAt).toUTCString()}) ===
Tracking ${snap.totalCoins} coins by market cap.

TOP SPIKES (by 1h move):
${spikes}

VOLATILITY LEADERS (by 24h std dev of hourly returns):
${vols}`;
}
