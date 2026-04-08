// ─────────────────────────────────────────────
// hooks/useMarketData.ts — Market data fetcher
//
// Fetches from /api/coins and auto-refreshes on interval.
// Computes spikes & volatility client-side from raw data.
// ─────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  CoinMarket,
  SpikeEntry,
  VolatilityEntry,
  MarketSnapshot,
} from "@/types";
import {
  processSpikes,
  processVolatility,
  buildMarketSnapshot,
} from "@/lib/utils";

const REFRESH_MS = Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL ?? 300_000);

interface MarketDataState {
  coins: CoinMarket[];
  spikes: SpikeEntry[];
  volatility: VolatilityEntry[];
  snapshot: MarketSnapshot | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchedAt: Date | null;
  refresh: () => void;
}

export function useMarketData(): MarketDataState {
  const [coins, setCoins] = useState<CoinMarket[]>([]);
  const [spikes, setSpikes] = useState<SpikeEntry[]>([]);
  const [volatility, setVolatility] = useState<VolatilityEntry[]>([]);
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      if (isBackground) setIsRefreshing(true);
      else setIsLoading(true);

      setError(null);

      const res = await fetch("/api/coins", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const rawCoins: CoinMarket[] = data.coins;

      // Process data client-side
      const processedSpikes = processSpikes(rawCoins);
      const processedVols = processVolatility(rawCoins);
      const snap = buildMarketSnapshot(processedSpikes, processedVols, rawCoins.length);

      setCoins(rawCoins);
      setSpikes(processedSpikes);
      setVolatility(processedVols);
      setSnapshot(snap);
      setFetchedAt(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch market data";
      console.error("[useMarketData]", msg);
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Auto-refresh interval
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, REFRESH_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    coins,
    spikes,
    volatility,
    snapshot,
    isLoading,
    isRefreshing,
    error,
    fetchedAt,
    refresh,
  };
}
