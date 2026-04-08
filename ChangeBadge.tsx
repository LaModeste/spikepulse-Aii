// ─────────────────────────────────────────────
// components/ChangeBadge.tsx
// Colored % change pill used in both tables
// ─────────────────────────────────────────────

"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatPct } from "@/lib/utils";

interface ChangeBadgeProps {
  value: number | null | undefined;
  /** Show a small trend icon alongside the number */
  showIcon?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  className?: string;
}

export function ChangeBadge({
  value,
  showIcon = false,
  size = "md",
  className,
}: ChangeBadgeProps) {
  if (value == null) {
    return (
      <span className={cn("text-muted-foreground font-mono", className)}>—</span>
    );
  }

  const isUp = value > 0;
  const isDown = value < 0;
  const isFlat = value === 0;

  const colorClass = isUp
    ? "text-spike-up"
    : isDown
    ? "text-spike-down"
    : "text-muted-foreground";

  const bgClass = isUp
    ? "bg-spike-up/10 border-spike-up/20"
    : isDown
    ? "bg-spike-down/10 border-spike-down/20"
    : "bg-muted/30 border-border";

  const sizeClass = size === "sm" ? "text-[11px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";

  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  // Strong moves get a glow effect
  const isStrong = Math.abs(value) >= 5;
  const glowClass = isStrong && isUp ? "glow-up" : isStrong && isDown ? "glow-down" : "";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded font-mono font-medium border",
        sizeClass,
        colorClass,
        bgClass,
        glowClass,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      {formatPct(value)}
    </span>
  );
}
