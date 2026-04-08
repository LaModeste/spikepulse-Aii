// ─────────────────────────────────────────────
// components/StatCards.tsx
// Summary stat cards at top of dashboard
// ─────────────────────────────────────────────

"use client";

import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { cn, formatPct, formatPrice } from "@/lib/utils";
import { SkeletonBar } from "./SkeletonTable";
import type { SpikeEntry, VolatilityEntry } from "@/types";

interface StatCardsProps {
  spikes: SpikeEntry[];
  volatility: VolatilityEntry[];
  isLoading: boolean;
}

export function StatCards({ spikes, volatility, isLoading }: StatCardsProps) {
  // Compute summary stats
  const topGainer = spikes.find((s) => (s.change_1h ?? 0) > 0);
  const topLoser = [...spikes].sort((a, b) => (a.change_1h ?? 0) - (b.change_1h ?? 0))[0];
  const topVol = volatility[0];
  const gainers = spikes.filter((s) => (s.change_24h ?? 0) > 0).length;
  const losers = spikes.filter((s) => (s.change_24h ?? 0) < 0).length;
  const sentiment = gainers > losers ? "BULLISH" : gainers < losers ? "BEARISH" : "NEUTRAL";
  const sentimentColor =
    sentiment === "BULLISH"
      ? "text-spike-up"
      : sentiment === "BEARISH"
      ? "text-spike-down"
      : "text-spike-warn";

  const cards = [
    {
      title: "TOP GAINER (1H)",
      icon: TrendingUp,
      iconColor: "text-spike-up",
      borderColor: "border-spike-up/20",
      value: isLoading ? null : topGainer ? topGainer.symbol : "—",
      sub: isLoading ? null : topGainer ? formatPct(topGainer.change_1h) : "—",
      subColor: "text-spike-up",
    },
    {
      title: "TOP LOSER (1H)",
      icon: TrendingDown,
      iconColor: "text-spike-down",
      borderColor: "border-spike-down/20",
      value: isLoading ? null : topLoser ? topLoser.symbol : "—",
      sub: isLoading ? null : topLoser ? formatPct(topLoser.change_1h) : "—",
      subColor: "text-spike-down",
    },
    {
      title: "MOST VOLATILE",
      icon: Activity,
      iconColor: "text-spike-pulse",
      borderColor: "border-spike-pulse/20",
      value: isLoading ? null : topVol ? topVol.symbol : "—",
      sub: isLoading ? null : topVol ? `σ=${(topVol.stddev_24h * 100).toFixed(3)}%` : "—",
      subColor: "text-spike-pulse",
    },
    {
      title: "MARKET MOOD",
      icon: BarChart3,
      iconColor: sentimentColor,
      borderColor:
        sentiment === "BULLISH"
          ? "border-spike-up/20"
          : sentiment === "BEARISH"
          ? "border-spike-down/20"
          : "border-spike-warn/20",
      value: isLoading ? null : sentiment,
      sub: isLoading ? null : `${gainers}↑ ${losers}↓`,
      subColor: "text-muted-foreground",
      valueColor: sentimentColor,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={cn(
              "card-glow rounded-xl px-4 py-3 border",
              card.borderColor
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
                {card.title}
              </span>
              <Icon className={cn("w-3.5 h-3.5", card.iconColor)} />
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <SkeletonBar className="h-5 w-16" />
                <SkeletonBar className="h-3 w-12" />
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "font-mono font-bold text-base tracking-wide",
                    card.valueColor ?? "text-foreground"
                  )}
                >
                  {card.value}
                </div>
                <div className={cn("text-xs font-mono mt-0.5", card.subColor)}>
                  {card.sub}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
