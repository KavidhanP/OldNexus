"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ClientAllocation } from "@/types/nexus";
import { formatUSD } from "@/lib/utils";

const ASSET_COLORS: Record<string, string> = {
  GOLD: "#d4a843",
  EQUITY: "#6b0b0c",
  PE: "#2563eb",
  CASH: "#94a3b8",
  OTHER: "#c084fc",
};

interface AllocationChartProps {
  allocations: ClientAllocation[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: ClientAllocation }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-glass border border-white/40">
      <p className="font-semibold text-slate-700">{item.asset_class}</p>
      <p className="text-slate-500">{item.percentage}% · {formatUSD(item.value_usd, true)}</p>
    </div>
  );
}

export default function AllocationChart({ allocations }: AllocationChartProps) {
  const data = allocations.map((a) => ({
    ...a,
    name: a.asset_class,
    value: a.percentage,
  }));

  return (
    <div style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.asset_class}
                fill={ASSET_COLORS[entry.asset_class] ?? "#94a3b8"}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value: string) => (
              <span className="text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
