// ─────────────────────────────────────────────
// app/layout.tsx — Root layout
// ─────────────────────────────────────────────

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpikePulse AI — Crypto Volatility Watcher",
  description:
    "Real-time crypto spike detection and volatility analysis powered by AI. Track the top 150 coins, spot spikes instantly, and get AI-powered market insights.",
  keywords: ["crypto", "volatility", "bitcoin", "trading", "AI", "market analysis"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
