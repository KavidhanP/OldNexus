"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { KpiData } from "@/types/nexus";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  kpi: KpiData;
  delay?: number;
}

export default function KpiCard({ kpi, delay = 0 }: KpiCardProps) {
  const isUp = kpi.trend === "UP";
  const isDown = kpi.trend === "DOWN";

  // Dynamically resolve lucide icon
  const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[kpi.icon];

  return (
    <div
      className="card-hover p-5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(107, 11, 12, 0.08)" }}
        >
          {IconComponent && <IconComponent className="w-5 h-5 text-burgundy-900" />}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            isUp && "bg-emerald-50 text-emerald-700",
            isDown && "bg-red-50 text-red-700",
            !isUp && !isDown && "bg-slate-50 text-slate-500"
          )}
        >
          {isUp && <TrendingUp className="w-3 h-3" />}
          {isDown && <TrendingDown className="w-3 h-3" />}
          {!isUp && !isDown && <Minus className="w-3 h-3" />}
          {Math.abs(kpi.change).toFixed(1)}%
        </div>
      </div>

      <p className="text-3xl font-bold text-slate-900 tabular-nums">{kpi.value}</p>
      <p className="text-sm text-frost-600 mt-1">{kpi.label}</p>

      {/* Bottom accent bar */}
      <div className="mt-4 h-0.5 rounded-full overflow-hidden bg-frost-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(Math.abs(kpi.change) * 4, 100)}%`,
            background: isUp
              ? "linear-gradient(90deg, #6b0b0c, #c02d3a)"
              : isDown
              ? "#dc2626"
              : "#94a3b8",
          }}
        />
      </div>
    </div>
  );
}
