// ─────────────────────────────────────────────
// hooks/useChat.ts — AI Chat state & API calls
// ─────────────────────────────────────────────

"use client";

import { useState, useCallback, useRef } from "react";
import type { ChatMessage, MarketSnapshot } from "@/types";

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string, snapshot: MarketSnapshot | null) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([
    // Seed with a welcome message from the AI
    {
      id: "welcome",
      role: "assistant",
      content:
        "⚡ SpikePulse AI online. I'm tracking the top coins for spikes and volatility. Ask me anything — \"what's spiking right now?\", \"which coins are most volatile?\", or \"give me the market pulse\".",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const idCounter = useRef(0);

  const nextId = () => `msg-${Date.now()}-${idCounter.current++}`;

  const sendMessage = useCallback(
    async (text: string, snapshot: MarketSnapshot | null) => {
      if (!text.trim() || isLoading) return;

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: nextId(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            marketSnapshot: snapshot,
          }),
        });

        const data = await res.json();

        const assistantMsg: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: data.error
            ? `⚠️ ${data.error}`
            : data.reply ?? "No response.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errMsg: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: "⚠️ Network error. Check your connection and try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: nextId(),
        role: "assistant",
        content: "Chat cleared. What would you like to know about the market?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}
