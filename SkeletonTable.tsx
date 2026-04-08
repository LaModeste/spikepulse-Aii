// ─────────────────────────────────────────────
// components/SkeletonTable.tsx
// Shimmer skeleton shown while data loads
// ─────────────────────────────────────────────

"use client";

import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

function SkeletonCell({ width = "w-full" }: { width?: string }) {
  return (
    <div className={cn("h-3.5 rounded shimmer", width)} />
  );
}

export function SkeletonTable({ rows = 10, cols = 6, className }: SkeletonTableProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Header row */}
      <div className="flex gap-4 px-4 py-3 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1">
            <SkeletonCell width="w-16" />
          </div>
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 px-4 py-3.5 border-b border-border/50"
          style={{ opacity: 1 - rowIdx * 0.06 }}
        >
          {/* Rank */}
          <div className="w-6 flex items-center">
            <SkeletonCell width="w-4" />
          </div>
          {/* Coin with icon */}
          <div className="flex-1 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full shimmer flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <SkeletonCell width="w-14" />
              <SkeletonCell width="w-20" />
            </div>
          </div>
          {/* Other cols */}
          {Array.from({ length: cols - 2 }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center justify-end">
              <SkeletonCell width="w-14" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Single shimmer bar — reusable inline skeleton */
export function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("rounded shimmer", className)} />;
}
