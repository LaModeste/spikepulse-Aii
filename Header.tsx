// ─────────────────────────────────────────────
// components/Header.tsx
// ─────────────────────────────────────────────

"use client";

import { RefreshCw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  fetchedAt: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  coinCount: number;
}

export function Header({ fetchedAt, isRefreshing, onRefresh, coinCount }: HeaderProps) {
  const timeStr = fetchedAt
    ? fetchedAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-spike-up/10 border border-spike-up/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-spike-up" />
          </div>
          <div>
            <div className="font-mono font-bold text-sm tracking-wider text-foreground">
              SPIKE<span className="text-spike-pulse">PULSE</span>{" "}
              <span className="text-muted-foreground font-normal">AI</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              CRYPTO VOLATILITY WATCHER
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground">
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-spike-up">LIVE</span>
          </div>

          {/* Coin count */}
          <div className="text-muted-foreground">
            {coinCount > 0 ? (
              <>
                <span className="text-foreground font-medium">{coinCount}</span> coins
              </>
            ) : (
              "Loading..."
            )}
          </div>

          {/* Last updated */}
          <div className="text-muted-foreground">
            Updated{" "}
            <span className="text-foreground">{timeStr}</span>
          </div>

          {/* Auto-refresh note */}
          <div className="text-muted-foreground/60">
            ↻ 5m
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono",
            "border border-border bg-muted/50 text-muted-foreground",
            "hover:border-spike-pulse/50 hover:text-spike-pulse hover:bg-spike-pulse/5",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          title="Refresh market data"
        >
          <RefreshCw
            className={cn("w-3 h-3", isRefreshing && "animate-spin")}
          />
          <span className="hidden sm:inline">
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>
    </header>
  );
}
