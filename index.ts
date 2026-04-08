// ─────────────────────────────────────────────
// SpikePulse AI — Shared Types
// ─────────────────────────────────────────────

/** Raw coin data from CoinGecko /coins/markets */
export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_24h_in_currency: number | null;
  price_change_percentage_7d_in_currency: number | null;
  // 15m change is calculated client-side from spark data
  price_change_percentage_15m?: number | null;
  sparkline_in_7d?: { price: number[] };
}

/** Processed spike entry shown in the Top Spikes table */
export interface SpikeEntry {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change_15m: number | null; // estimated from most recent hourly data
  change_1h: number | null;
  change_4h: number | null;
  change_24h: number | null;
  volume24h: number;
  rank: number;
}

/** Processed volatility entry shown in the Volatility Leaders table */
export interface VolatilityEntry {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  stddev_24h: number; // std dev of hourly returns over last 24h
  stddev_7d: number;  // std dev of hourly returns over last 7d
  avg_return_24h: number;
  rank: number;
}

/** Sort columns for the Spikes table */
export type SpikeSortKey = "change_15m" | "change_1h" | "change_4h" | "change_24h";

/** Sort direction */
export type SortDir = "asc" | "desc";

/** A single AI chat message */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/** Payload sent to /api/chat */
export interface ChatRequest {
  message: string;
  marketSnapshot: MarketSnapshot;
}

/** Summarized market data injected into AI context */
export interface MarketSnapshot {
  topSpikes: SpikeEntry[];
  volatilityLeaders: VolatilityEntry[];
  fetchedAt: string;
  totalCoins: number;
}

/** Response from /api/chat */
export interface ChatResponse {
  reply: string;
  error?: string;
}

/** Response from /api/coins */
export interface CoinsApiResponse {
  coins: CoinMarket[];
  fetchedAt: string;
  error?: string;
}

/** Telegram webhook update (simplified) */
export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
  };
}
