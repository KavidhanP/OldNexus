"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MarketDataPoint } from "@/types/nexus";

interface AssetChartProps {
  data: MarketDataPoint[];
}

const formatPortfolio = (value: number) =>
  `$${(value / 1_000_000).toFixed(2)}M`;

const formatIndex = (value: number) =>
  value.toLocaleString("en-US");

// Custom tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 text-xs shadow-glass-lg border border-white/40">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">
            {p.name === "Client Portfolio"
              ? formatPortfolio(p.value)
              : p.name === "Gold ($/oz)"
              ? `$${p.value.toLocaleString("en-US")}`
              : p.value.toLocaleString("en-US")}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AssetChart({ data }: AssetChartProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Asset Performance</h2>
          <p className="text-xs text-frost-600 mt-0.5">12-month trailing — US30 · Gold · Client Portfolio</p>
        </div>
        <span className="badge badge-green">Live</span>
      </div>

      {/* Dual-axis chart: left = US30 index, right = Portfolio USD */}
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="us30Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b0b0c" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6b0b0c" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4a843" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3edf2" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#7a9cb0" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="index"
              tick={{ fontSize: 11, fill: "#7a9cb0" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatIndex}
              width={55}
            />
            <YAxis
              yAxisId="portfolio"
              orientation="right"
              tick={{ fontSize: 11, fill: "#7a9cb0" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatPortfolio}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 16 }}
              iconType="circle"
              iconSize={8}
            />
            <Area
              yAxisId="index"
              type="monotone"
              dataKey="us30"
              name="US30"
              stroke="#6b0b0c"
              strokeWidth={2}
              fill="url(#us30Grad)"
              dot={false}
              activeDot={{ r: 4, fill: "#6b0b0c" }}
            />
            <Area
              yAxisId="index"
              type="monotone"
              dataKey="gold"
              name="Gold ($/oz)"
              stroke="#d4a843"
              strokeWidth={2}
              fill="url(#goldGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#d4a843" }}
            />
            <Area
              yAxisId="portfolio"
              type="monotone"
              dataKey="portfolio"
              name="Client Portfolio"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#portfolioGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#2563eb" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
