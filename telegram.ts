// ─────────────────────────────────────────────
// lib/telegram.ts — Telegram Bot API helpers
// Set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in .env.local
// ─────────────────────────────────────────────

import type { SpikeEntry, VolatilityEntry } from "@/types";
import { formatPct, formatPrice, formatVolume } from "./utils";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Send a plain text or HTML message to a Telegram chat.
 * @param chatId  Telegram chat/user ID (defaults to TELEGRAM_CHAT_ID env var)
 * @param text    Message text (supports HTML parse_mode)
 */
export async function sendTelegramMessage(
  text: string,
  chatId = process.env.TELEGRAM_CHAT_ID
): Promise<void> {
  if (!BOT_TOKEN || !chatId) {
    console.warn("[Telegram] BOT_TOKEN or CHAT_ID not configured, skipping.");
    return;
  }

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[Telegram] Send failed:", err);
  }
}

/**
 * Build a formatted spike summary message for Telegram.
 * Called by the hourly cron or /spike command.
 */
export function buildSpikeSummary(
  spikes: SpikeEntry[],
  vols: VolatilityEntry[]
): string {
  const topSpikes = spikes.slice(0, 5);
  const topVols = vols.slice(0, 5);

  const spikeLines = topSpikes
    .map((s) => {
      const emoji = (s.change_1h ?? 0) >= 0 ? "🟢" : "🔴";
      return `${emoji} <b>${s.symbol}</b> ${formatPct(s.change_1h)} (1h) | ${formatPct(s.change_24h)} (24h) | ${formatPrice(s.price)}`;
    })
    .join("\n");

  const volLines = topVols
    .map(
      (v) =>
        `⚡ <b>${v.symbol}</b> σ24h=${(v.stddev_24h * 100).toFixed(3)}% @ ${formatPrice(v.price)}`
    )
    .join("\n");

  const now = new Date().toUTCString();

  return `<b>⚡ SpikePulse AI — Market Update</b>
<i>${now}</i>

<b>🔥 Top Spikes:</b>
${spikeLines}

<b>📊 Volatility Leaders:</b>
${volLines}

<i>Track more at SpikePulse AI dashboard.</i>`;
}

/**
 * Register your webhook URL with Telegram so it can push updates to you.
 * Call once during deployment setup:
 *   GET /api/telegram?action=setWebhook&url=https://yourdomain.com/api/telegram
 */
export async function setWebhook(webhookUrl: string): Promise<unknown> {
  const res = await fetch(
    `${TELEGRAM_API}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
  );
  return res.json();
}
