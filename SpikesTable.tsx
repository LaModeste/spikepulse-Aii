// ─────────────────────────────────────────────
// components/SpikesTable.tsx
// Sortable table showing top price spikes
// ─────────────────────────────────────────────

"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpDown, ArrowUp, ArrowDown, Flame } from "lucide-react";
import { cn, formatPrice, formatVolume } from "@/lib/utils";
import { ChangeBadge } from "./ChangeBadge";
import { SkeletonTable } from "./SkeletonTable";
import type { SpikeEntry, SpikeSortKey, SortDir } from "@/types";

interface SpikesTableProps {
  spikes: SpikeEntry[];
  isLoading: boolean;
}

interface Column {
  key: SpikeSortKey;
  label: string;
  title: string;
}

const SORT_COLS: Column[] = [
  { key: "change_15m", label: "15m", title: "15-minute change (estimated)" },
  { key: "change_1h",  label: "1h",  title: "1-hour change" },
  { key: "change_4h",  label: "4h",  title: "4-hour change" },
  { key: "change_24h", label: "24h", title: "24-hour change" },
];

export function SpikesTable({ spikes, isLoading }: SpikesTableProps) {
  const [sortKey, setSortKey] = useState<SpikeSortKey>("change_1h");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Sort handler ────────────────────────────
  function handleSort(key: SpikeSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  // ── Sort data ───────────────────────────────
  const sorted = [...spikes].sort((a, b) => {
    const av = Math.abs(a[sortKey] ?? 0);
    const bv = Math.abs(b[sortKey] ?? 0);
    // For ascending, sort by raw value (not absolute)
    const aRaw = a[sortKey] ?? 0;
    const bRaw = b[sortKey] ?? 0;
    if (sortDir === "desc") return bv - av;
    return aRaw - bRaw;
  });

  // Show top 25 in the table
  const visible = sorted.slice(0, 25);

  return (
    <div className="card-glow rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-spike-warn" />
          <h2 className="font-mono font-semibold text-sm tracking-wide text-foreground">
            TOP SPIKES
          </h2>
          {!isLoading && (
            <span className="text-xs text-muted-foreground font-mono">
              ({spikes.length} coins)
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono">
          Click column to sort
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={10} cols={7} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 w-8">#</th>
                <th className="text-left px-4 py-2.5">Coin</th>
                <th className="text-right px-4 py-2.5">Price</th>

                {/* Sortable change columns */}
                {SORT_COLS.map((col) => (
                  <th
                    key={col.key}
                    className="text-right px-3 py-2.5 cursor-pointer select-none group"
                    onClick={() => handleSort(col.key)}
                    title={col.title}
                  >
                    <div className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                      {col.label}
                      <SortIcon
                        active={sortKey === col.key}
                        dir={sortDir}
                      />
                    </div>
                  </th>
                ))}

                <th className="text-right px-4 py-2.5">Volume 24h</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((coin, idx) => (
                <SpikeRow key={coin.id} coin={coin} rank={idx + 1} sortKey={sortKey} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Individual table row ──────────────────────
function SpikeRow({
  coin,
  rank,
  sortKey,
}: {
  coin: SpikeEntry;
  rank: number;
  sortKey: SpikeSortKey;
}) {
  // Highlight the active sort column's value
  const isHot = Math.abs(coin[sortKey] ?? 0) >= 5;

  return (
    <tr
      className={cn(
        "border-b border-border/40 table-row-hover transition-colors",
        isHot && "bg-spike-up/[0.03]"
      )}
    >
      {/* Rank */}
      <td className="px-4 py-3 text-xs font-mono text-muted-foreground/60">
        {rank}
      </td>

      {/* Coin identity */}
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
                unoptimized // CoinGecko images, skip Next optimization
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

      {/* Change columns */}
      {(["change_15m", "change_1h", "change_4h", "change_24h"] as SpikeSortKey[]).map(
        (key) => (
          <td
            key={key}
            className={cn(
              "px-3 py-3 text-right",
              sortKey === key && "bg-muted/20"
            )}
          >
            <ChangeBadge value={coin[key]} size="sm" />
          </td>
        )
      )}

      {/* Volume */}
      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
        {formatVolume(coin.volume24h)}
      </td>
    </tr>
  );
}

// ── Sort icon ─────────────────────────────────
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  }
  return dir === "desc" ? (
    <ArrowDown className="w-3 h-3 text-spike-pulse" />
  ) : (
    <ArrowUp className="w-3 h-3 text-spike-pulse" />
  );
}
