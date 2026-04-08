# ⚡ SpikePulse AI

> Real-time crypto volatility & spike watcher with AI-powered market analysis.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## Features

- 🔥 **Top Spikes Table** — sortable by 15m / 1h / 4h / 24h % change
- 📊 **Volatility Leaders** — 24h & 7d std dev of hourly log-returns
- 🤖 **AI Chat Sidebar** — ask natural language questions, get trader-style analysis
- 📱 **Telegram Bot** — `/spike` command + hourly summaries via Vercel cron
- ⚡ **Live Data** — CoinGecko free tier, auto-refreshes every 5 minutes
- 🌑 **Dark terminal UI** — IBM Plex Mono, neon accents

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/you/spikepulse-ai
cd spikepulse-ai
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 3. Run locally
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | Claude API key for AI chat |
| `AI_PROVIDER` | No | `anthropic` (default) or `openai` |
| `OPENAI_API_KEY` | If openai | OpenAI key (alternative to Claude) |
| `COINGECKO_API_KEY` | No | Pro key for higher rate limits |
| `TELEGRAM_BOT_TOKEN` | No | For Telegram bot feature |
| `TELEGRAM_CHAT_ID` | No | Your Telegram chat/user ID |
| `NEXT_PUBLIC_REFRESH_INTERVAL` | No | Ms between refreshes (default: 300000) |
| `NEXT_PUBLIC_COIN_LIMIT` | No | Coins to track (default: 150) |

---

## Deploy to Vercel

### Option A: Vercel CLI
```bash
npm i -g vercel
vercel --prod
# Follow prompts, then add env vars in Vercel dashboard
```

### Option B: GitHub → Vercel
1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repo
4. Add environment variables in Project Settings → Environment Variables
5. Deploy!

---

## Telegram Bot Setup

1. Message `@BotFather` on Telegram → `/newbot` → get your token
2. Set `TELEGRAM_BOT_TOKEN` in env
3. Get your chat ID from `@userinfobot`
4. Set `TELEGRAM_CHAT_ID` in env
5. After deploying, register your webhook:
   ```
   GET https://yourapp.vercel.app/api/telegram?action=setWebhook&url=https://yourapp.vercel.app/api/telegram
   ```
6. Send `/spike` to your bot!

The `vercel.json` cron will automatically send an hourly summary to your `TELEGRAM_CHAT_ID`.

---

## Project Structure

```
spikepulse-ai/
├── app/
│   ├── api/
│   │   ├── coins/route.ts      # CoinGecko proxy + cache
│   │   ├── chat/route.ts       # AI chat (Claude/OpenAI)
│   │   └── telegram/route.ts   # Telegram bot webhook
│   ├── dashboard/page.tsx      # Main dashboard
│   ├── layout.tsx
│   ├── page.tsx                # Redirects to /dashboard
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── StatCards.tsx
│   ├── SpikesTable.tsx
│   ├── VolatilityTable.tsx
│   ├── ChatSidebar.tsx
│   ├── ChangeBadge.tsx
│   ├── SkeletonTable.tsx
│   └── ErrorState.tsx
├── hooks/
│   ├── useMarketData.ts        # Data fetching + auto-refresh
│   └── useChat.ts              # AI chat state
├── lib/
│   ├── utils.ts                # Math, formatters, data processing
│   ├── coingecko.ts            # API client
│   └── telegram.ts             # Bot helpers
├── types/index.ts              # All TypeScript types
├── .env.example
├── vercel.json                 # Cron + function config
└── README.md
```

---

## Iterating

The code is heavily commented. Key places to extend:

- **Add a new table column** → `types/index.ts` + the relevant table component
- **Change AI persona** → `SYSTEM_PROMPT` in `app/api/chat/route.ts`
- **Add more timeframes** → `processSpikes()` in `lib/utils.ts`
- **Change refresh rate** → `NEXT_PUBLIC_REFRESH_INTERVAL` in `.env.local`
- **Add price alerts** → new API route + webhook logic in `lib/telegram.ts`

---

## Notes

- 15m change is **estimated** from the last two hourly sparkline data points (CoinGecko free tier doesn't provide sub-hourly data)
- Volatility is calculated as the **standard deviation of log-returns** from hourly prices — a standard financial metric
- Not financial advice. For educational/entertainment purposes.
