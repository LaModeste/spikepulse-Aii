// ─────────────────────────────────────────────
// components/VolatilityTable.tsx
// Table showing coins ranked by stddev of returns
// ─────────────────────────────────────────────

"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpDown, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { cn, formatPrice, formatStdDev } from "@/lib/utils";
import { ChangeBadge } from "./ChangeBadge";
import { SkeletonTable } from "./SkeletonTable";
import type { VolatilityEntry, SortDir } from "@/types";

type VolSortKey = "stddev_24h" | "stddev_7d";

interface VolatilityTableProps {
  volatility: VolatilityEntry[];
  isLoading: boolean;
}

export function VolatilityTable({ volatility, isLoading }: VolatilityTableProps) {
  const [sortKey, setSortKey] = useState<VolSortKey>("stddev_24h");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: VolSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...volatility].sort((a, b) => {
    const diff = b[sortKey] - a[sortKey];
    return sortDir === "desc" ? diff : -diff;
  });

  const visible = sorted.slice(0, 25);

  // Color volatility level: low < 0.5% < med < 2% < high
  function volColor(v: number): string {
    if (v > 0.02) return "text-spike-down";   // very high
    if (v > 0.01) return "text-spike-warn";   // high
    if (v > 0.005) return "text-spike-pulse"; // medium
    return "text-muted-foreground";           // low
  }

  function volLabel(v: number): string {
    if (v > 0.02) return "EXTREME";
    if (v > 0.01) return "HIGH";
    if (v > 0.005) return "MED";
    return "LOW";
  }

  return (
    <div className="card-glow rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-spike-pulse" />
          <h2 className="font-mono font-semibold text-sm tracking-wide text-foreground">
            VOLATILITY LEADERS
          </h2>
          {!isLoading && (
            <span className="text-xs text-muted-foreground font-mono">
              (σ of hourly returns)
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono">
          Click column to sort
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={10} cols={6} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="border-b border-border text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 w-8">#</th>
                <th className="text-left px-4 py-2.5">Coin</th>
                <th className="text-right px-4 py-2.5">Price</th>

                {/* Sortable stddev columns */}
                {(["stddev_24h", "stddev_7d"] as VolSortKey[]).map((key) => (
                  <th
                    key={key}
                    className="text-right px-3 py-2.5 cursor-pointer select-none"
                    onClick={() => handleSort(key)}
                    title={
                      key === "stddev_24h"
                        ? "Std dev of hourly log-returns over last 24h"
                        : "Std dev of hourly log-returns over last 7 days"
                    }
                  >
                    <div className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                      σ {key === "stddev_24h" ? "24h" : "7d"}
                      <SortIcon active={sortKey === key} dir={sortDir} />
                    </div>
                  </th>
                ))}

                <th className="text-right px-4 py-2.5">Avg Return 24h</th>
                <th className="text-right px-4 py-2.5">Level</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((coin, idx) => (
                <tr
                  key={coin.id}
                  className="border-b border-border/40 table-row-hover"
                >
                  {/* Rank */}
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground/60">
                    {idx + 1}
                  </td>

                  {/* Coin */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                        {coin.image && (
                          <Image
                            src={coin.image}
                            alt={coin.name}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono font-semibold text-xs text-foreground">
                          {coin.symbol}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                          {coin.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                    {formatPrice(coin.price)}
                  </td>

                  {/* σ 24h */}
                  <td
                    className={cn(
                      "px-3 py-3 text-right font-mono text-xs font-medium",
                      sortKey === "stddev_24h" && "bg-muted/20",
                      volColor(coin.stddev_24h)
                    )}
                  >
                    {formatStdDev(coin.stddev_24h)}
                  </td>

                  {/* σ 7d */}
                  <td
                    className={cn(
                      "px-3 py-3 text-right font-mono text-xs",
                      sortKey === "stddev_7d" && "bg-muted/20",
                      volColor(coin.stddev_7d)
                    )}
                  >
                    {formatStdDev(coin.stddev_7d)}
                  </td>

                  {/* Avg return 24h */}
                  <td className="px-4 py-3 text-right">
                    <ChangeBadge value={coin.avg_return_24h * 100} size="sm" />
                  </td>

                  {/* Volatility level badge */}
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border",
                        coin.stddev_24h > 0.02
                          ? "border-spike-down/30 bg-spike-down/10 text-spike-down"
                          : coin.stddev_24h > 0.01
                          ? "border-spike-warn/30 bg-spike-warn/10 text-spike-warn"
                          : coin.stddev_24h > 0.005
                          ? "border-spike-pulse/30 bg-spike-pulse/10 text-spike-pulse"
                          : "border-border bg-muted/30 text-muted-foreground"
                      )}
                    >
                      {volLabel(coin.stddev_24h)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return dir === "desc" ? (
    <ArrowDown className="w-3 h-3 text-spike-pulse" />
  ) : (
    <ArrowUp className="w-3 h-3 text-spike-pulse" />
  );
}
