// ─────────────────────────────────────────────
// components/ChatSidebar.tsx
// AI-powered chat panel — trader-style market analysis
// ─────────────────────────────────────────────

"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Bot, User, Trash2, Zap, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage, MarketSnapshot } from "@/types";

interface ChatSidebarProps {
  messages: ChatMessage[];
  isLoading: boolean;
  snapshot: MarketSnapshot | null;
  onSendMessage: (text: string, snapshot: MarketSnapshot | null) => Promise<void>;
  onClear: () => void;
}

// Quick-action prompt suggestions
const QUICK_PROMPTS = [
  "What's spiking right now?",
  "Give me the market pulse",
  "Which coins are most volatile?",
  "Any high-risk moves today?",
  "Top gainers and losers?",
];

export function ChatSidebar({
  messages,
  isLoading,
  snapshot,
  onSendMessage,
  onClear,
}: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleSend() {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim(), snapshot);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Send on Enter (not Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleQuickPrompt(prompt: string) {
    onSendMessage(prompt, snapshot);
  }

  // ── Collapsed state: show a tab ────────────
  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-30",
          "flex flex-col items-center gap-2 px-2 py-4 rounded-l-lg",
          "bg-card border border-r-0 border-border",
          "hover:border-spike-pulse/50 hover:bg-spike-pulse/5 transition-all",
          "text-muted-foreground hover:text-spike-pulse"
        )}
        title="Open AI chat"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-[10px] font-mono tracking-widest [writing-mode:vertical-rl] rotate-180">
          AI CHAT
        </span>
        <Zap className="w-3 h-3" />
      </button>
    );
  }

  return (
    <aside className="w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 flex flex-col h-[calc(100vh-57px)] sticky top-[57px] border-l border-border bg-card/50">

      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-spike-pulse/10 border border-spike-pulse/20 flex items-center justify-center">
            <Zap className="w-3 h-3 text-spike-pulse" />
          </div>
          <div>
            <div className="font-mono text-xs font-semibold text-foreground tracking-wide">
              AI ANALYST
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              {snapshot ? "Market data loaded ✓" : "Loading data..."}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Clear chat */}
          <button
            onClick={onClear}
            className="p-1.5 rounded text-muted-foreground hover:text-spike-down hover:bg-spike-down/10 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {/* Collapse */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Collapse sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 chat-bubble">
            <div className="w-5 h-5 rounded-full bg-spike-pulse/20 border border-spike-pulse/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-spike-pulse" />
            </div>
            <div className="bg-muted rounded-lg rounded-tl-sm px-3 py-2">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-3 py-2 border-t border-border/50 flex-shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleQuickPrompt(p)}
              disabled={isLoading}
              className={cn(
                "flex-shrink-0 text-[11px] font-mono px-2.5 py-1 rounded-full",
                "border border-border bg-muted/30 text-muted-foreground",
                "hover:border-spike-pulse/50 hover:text-spike-pulse hover:bg-spike-pulse/5",
                "transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                "whitespace-nowrap"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="px-3 pb-3 pt-2 border-t border-border flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about spikes, volatility, market pulse..."
            rows={2}
            disabled={isLoading}
            className={cn(
              "flex-1 resize-none rounded-lg px-3 py-2",
              "bg-input border border-border text-foreground text-xs font-mono",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none focus:border-spike-pulse/50 focus:ring-1 focus:ring-spike-pulse/20",
              "disabled:opacity-50 transition-colors",
              "scrollbar-thin"
            )}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={cn(
              "p-2 rounded-lg flex-shrink-0",
              "bg-spike-pulse/10 border border-spike-pulse/30 text-spike-pulse",
              "hover:bg-spike-pulse/20 hover:border-spike-pulse/60",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "transition-all"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-muted-foreground/50 font-mono text-center">
          Enter to send · Shift+Enter for newline
        </div>
      </div>
    </aside>
  );
}

// ── Individual message bubble ─────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-2 chat-bubble",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser
            ? "bg-spike-up/20 border border-spike-up/30"
            : "bg-spike-pulse/20 border border-spike-pulse/30"
        )}
      >
        {isUser ? (
          <User className="w-3 h-3 text-spike-up" />
        ) : (
          <Bot className="w-3 h-3 text-spike-pulse" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed",
          isUser
            ? "bg-spike-up/10 border border-spike-up/20 text-foreground rounded-tr-sm"
            : "bg-muted border border-border text-foreground rounded-tl-sm font-mono"
        )}
      >
        {/* Render with basic line breaks */}
        {message.content.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < message.content.split("\n").length - 1 && <br />}
          </span>
        ))}

        {/* Timestamp */}
        <div className="mt-1 text-[10px] text-muted-foreground/40 font-mono">
          {message.timestamp.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
