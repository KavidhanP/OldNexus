"use client";

import type { DeltaReport, DeltaField } from "@/types/nexus";
import { AlertTriangle, CheckCircle, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatPct, discrepancyColor } from "@/lib/utils";

interface DeltaTableProps {
  report: DeltaReport;
}

function DiscrepancyBadge({ level }: { level: DeltaField["discrepancy_level"] }) {
  const map = {
    OK: { label: "OK", classes: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    WATCH: { label: "Watch", classes: "bg-amber-50 text-amber-700 border-amber-200", icon: Eye },
    DISCREPANCY: { label: "Discrepancy", classes: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
  };
  const { label, classes, icon: Icon } = map[level];
  return (
    <span className={`badge border ${classes}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function DeltaCell({ field }: { field: DeltaField }) {
  const pct = field.inflation_adjusted_change_pct ?? field.change_pct;
  if (pct === null) return <span className="text-slate-400 text-xs">N/A</span>;
  const isUp = pct > 0;
  const isDown = pct < 0;
  return (
    <span className={cn("flex items-center gap-1 text-xs font-semibold tabular-nums", discrepancyColor(field.discrepancy_level))}>
      {isUp && <TrendingUp className="w-3.5 h-3.5" />}
      {isDown && <TrendingDown className="w-3.5 h-3.5" />}
      {formatPct(pct)}
    </span>
  );
}

function formatValue(v: string | number): string {
  if (typeof v === "number") {
    if (v >= 1000) return v.toLocaleString("en-US");
    return String(v);
  }
  return v;
}

export default function DeltaTable({ report }: DeltaTableProps) {
  const { summary, fields, contract_a_year, contract_b_year, carrier_a, carrier_b } = report;

  return (
    <div className="space-y-6">
      {/* ── Summary Banner ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 border"
        style={{
          background: "linear-gradient(135deg, rgba(107,11,12,0.04) 0%, rgba(242,247,249,0.8) 100%)",
          borderColor: "rgba(107,11,12,0.12)",
        }}
      >
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-[10px] text-frost-600 uppercase tracking-wider font-semibold">Contract A</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{carrier_a} · {contract_a_year}</p>
          </div>
          <div className="flex items-center text-frost-400 text-lg">→</div>
          <div>
            <p className="text-[10px] text-frost-600 uppercase tracking-wider font-semibold">Contract B</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{carrier_b} · {contract_b_year}</p>
          </div>
          <div className="flex-1" />
          {/* Summary stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-red-600 tabular-nums">{summary.discrepancies}</p>
              <p className="text-[10px] text-frost-600 mt-0.5">Discrepancies</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-600 tabular-nums">{summary.watches}</p>
              <p className="text-[10px] text-frost-600 mt-0.5">Watches</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600 tabular-nums">{summary.ok_fields}</p>
              <p className="text-[10px] text-frost-600 mt-0.5">OK</p>
            </div>
            <div className="text-center">
              <p
                className={cn(
                  "text-xl font-bold tabular-nums",
                  summary.inflation_adjusted_change_pct > 15 ? "text-red-600" : "text-emerald-600"
                )}
              >
                {formatPct(summary.inflation_adjusted_change_pct)}
              </p>
              <p className="text-[10px] text-frost-600 mt-0.5">Adj. Premium Δ</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-frost-100 rounded-full overflow-hidden flex gap-0.5">
          <div
            className="h-full bg-red-500 rounded-l-full"
            style={{ width: `${(summary.discrepancies / summary.total_fields) * 100}%` }}
            title="Discrepancies"
          />
          <div
            className="h-full bg-amber-400"
            style={{ width: `${(summary.watches / summary.total_fields) * 100}%` }}
            title="Watches"
          />
          <div
            className="h-full bg-emerald-400 rounded-r-full flex-1"
            title="OK"
          />
        </div>
      </div>

      {/* ── Field Comparison Table ──────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>{contract_a_year} Value</th>
              <th>{contract_b_year} Value</th>
              <th>Adj. Change</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, i) => (
              <tr
                key={i}
                className={cn(field.discrepancy_level === "DISCREPANCY" && "discrepancy-row")}
              >
                <td className="font-semibold text-slate-800">{field.field_name}</td>
                <td className="tabular-nums text-slate-600">{formatValue(field.contract_a_value)}</td>
                <td className="tabular-nums text-slate-800 font-medium">{formatValue(field.contract_b_value)}</td>
                <td><DeltaCell field={field} /></td>
                <td><DiscrepancyBadge level={field.discrepancy_level} /></td>
                <td className="text-xs text-slate-500 max-w-xs">{field.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
