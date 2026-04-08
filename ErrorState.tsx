// ─────────────────────────────────────────────
// components/ErrorState.tsx
// Shown when the data fetch fails
// ─────────────────────────────────────────────

"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export function ErrorState({ message, onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-spike-down/10 border border-spike-down/30 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-spike-down" />
      </div>

      <div>
        <div className="font-mono font-semibold text-sm text-foreground mb-1">
          DATA FETCH FAILED
        </div>
        <div className="text-xs text-muted-foreground max-w-md font-mono">
          {message}
        </div>
        <div className="text-xs text-muted-foreground/60 mt-1 font-mono">
          CoinGecko free tier allows ~10-30 req/min. Wait a moment and retry.
        </div>
      </div>

      <button
        onClick={onRetry}
        disabled={isRetrying}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono",
          "border border-spike-pulse/40 bg-spike-pulse/10 text-spike-pulse",
          "hover:bg-spike-pulse/20 hover:border-spike-pulse/60",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        )}
      >
        <RefreshCw className={cn("w-3.5 h-3.5", isRetrying && "animate-spin")} />
        {isRetrying ? "Retrying..." : "Retry"}
      </button>
    </div>
  );
}
