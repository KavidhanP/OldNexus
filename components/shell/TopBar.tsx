"use client";

import { useEffect, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { mockTickers } from "@/lib/mock-data";
import type { MarketTicker } from "@/types/nexus";
import { cn } from "@/lib/utils";

function TickerItem({ ticker }: { ticker: MarketTicker }) {
  const isPositive = ticker.change >= 0;
  return (
    <span className="inline-flex items-center gap-2 px-4 text-xs">
      <span className="font-semibold text-slate-700">{ticker.symbol}</span>
      <span className="text-slate-500">{ticker.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      <span className={cn("font-medium", isPositive ? "text-emerald-600" : "text-red-600")}>
        {isPositive ? "▲" : "▼"} {Math.abs(ticker.change_pct).toFixed(2)}%
      </span>
    </span>
  );
}

function LiveClock() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-right" suppressHydrationWarning>
      <p className="text-sm font-semibold text-slate-700 tabular-nums" suppressHydrationWarning>{time}</p>
      <p className="text-[10px] text-frost-600" suppressHydrationWarning>{date}</p>
    </div>
  );
}

import { usePathname } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();
  if (pathname === "/landing") return null;
  const [tickers] = useState<MarketTicker[]>(mockTickers);

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center border-b border-frost-100 bg-white/80 backdrop-blur-md"
      style={{
        left: "var(--sidebar-width)",
        height: "var(--topbar-height)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Live Ticker ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-hidden border-r border-frost-100">
        <div className="ticker-wrapper">
          <div className="ticker-inner">
            {/* Render double for seamless loop */}
            {[...tickers, ...tickers].map((ticker, i) => (
              <TickerItem key={`${ticker.symbol}-${i}`} ticker={ticker} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Controls ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 flex-shrink-0">
        <button className="p-1.5 rounded-lg hover:bg-frost-100 transition-colors text-frost-600 hover:text-burgundy-900" title="Refresh data">
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-1.5 rounded-lg hover:bg-frost-100 transition-colors text-frost-600 hover:text-burgundy-900" title="Notifications">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </div>

        <div className="w-px h-5 bg-frost-100" />

        {/* Live Clock */}
        <LiveClock />
      </div>
    </header>
  );
}
