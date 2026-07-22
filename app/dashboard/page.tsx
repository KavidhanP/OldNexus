"use client";

import { useNexus } from "@/lib/store";
import KpiCard from "@/components/dashboard/KpiCard";
import AssetChart from "@/components/dashboard/AssetChart";
import { formatUSD, stageLabel } from "@/lib/utils";
import { mockMarketData } from "@/lib/mock-data";
import type { MATarget, KpiData } from "@/types/nexus";
import { AlertTriangle, ArrowRight, Clock, FileText, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

function RiskBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-red-50 text-red-700 border-red-200"
      : score >= 50
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return <span className={`badge border ${color}`}>{score}</span>;
}

function StagePill({ stage }: { stage: MATarget["stage"] }) {
  const color: Record<string, string> = {
    SCREENING: "bg-slate-50 text-slate-600 border-slate-200",
    INITIAL_DILIGENCE: "bg-blue-50 text-blue-700 border-blue-200",
    ADVANCED_DILIGENCE: "bg-purple-50 text-purple-700 border-purple-200",
    NEGOTIATION: "bg-amber-50 text-amber-700 border-amber-200",
    CLOSING: "bg-emerald-50 text-emerald-700 border-emerald-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-500 border-red-200",
  };
  return (
    <span className={`badge border text-[11px] ${color[stage] ?? ""}`}>
      {stageLabel(stage)}
    </span>
  );
}

export default function DashboardPage() {
  const { state } = useNexus();
  const { contracts, deltaReports, auditScans, activity } = state;

  // ── Live KPIs derived from store ────────────────────────────────────────────
  const totalDiscrepancies = deltaReports.reduce(
    (acc, r) => acc + r.summary.discrepancies,
    0
  );
  const totalFlags = auditScans.reduce((acc, s) => acc + s.results.length, 0);

  const liveKpis: KpiData[] = [
    {
      label: "Contracts Extracted",
      value: contracts.length === 0 ? "0" : String(contracts.length),
      change: contracts.length > 0 ? 100 : 0,
      trend: contracts.length > 0 ? "UP" : "FLAT",
      icon: "FileText",
    },
    {
      label: "Discrepancies Flagged",
      value: String(totalDiscrepancies),
      change: totalDiscrepancies > 0 ? -((totalDiscrepancies / Math.max(deltaReports.length * 8, 1)) * 100) : 0,
      trend: totalDiscrepancies > 0 ? "UP" : "FLAT",
      icon: "AlertTriangle",
    },
    {
      label: "M&A Scans",
      value: String(auditScans.length),
      change: auditScans.length > 0 ? 100 : 0,
      trend: auditScans.length > 0 ? "UP" : "FLAT",
      icon: "TrendingUp",
    },
    {
      label: "Red Flags Found",
      value: String(totalFlags),
      change: 0,
      trend: "FLAT",
      icon: "Users",
    },
  ];

  const hasActivity = activity.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Nexus Portal</h1>
          <p className="page-sub">Unified view of M&A pipeline and HNWI asset performance</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-frost-600">
          <Clock className="w-3.5 h-3.5" />
          <span>Live session · {new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>

      {/* ── Quick-action banner when no data yet ────────────────────────── */}
      {contracts.length === 0 && auditScans.length === 0 && (
        <div
          className="rounded-2xl p-5 border flex items-center gap-4 animate-fade-in"
          style={{ background: "rgba(107,11,12,0.03)", borderColor: "rgba(107,11,12,0.12)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(107,11,12,0.08)" }}>
            <FileText className="w-5 h-5 text-burgundy-900" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Get started — upload your first documents</p>
            <p className="text-xs text-frost-600 mt-0.5">
              Go to <Link href="/contracts" className="underline text-burgundy-900">Contracts</Link> to upload insurance PDFs, or{" "}
              <Link href="/audit" className="underline text-burgundy-900">Audit</Link> to scan a VDR document for M&A red flags.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link href="/contracts" className="btn-primary text-xs px-4 py-2">Upload Contracts</Link>
            <Link href="/audit" className="btn-ghost text-xs px-4 py-2">Start M&A Scan</Link>
          </div>
        </div>
      )}

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {liveKpis.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} delay={i * 80} />
        ))}
      </div>

      {/* ── Asset Chart + Activity ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AssetChart data={mockMarketData} />
        </div>

        {/* Activity Feed */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Recent Activity</h2>
          {!hasActivity ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="w-8 h-8 text-frost-200 mb-3" />
              <p className="text-xs text-frost-500">
                Activity will appear here as you upload contracts and run scans.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      item.type === "alert"
                        ? "bg-red-500"
                        : item.type === "audit"
                        ? "bg-amber-500"
                        : item.type === "crm"
                        ? "bg-blue-500"
                        : item.type === "compare"
                        ? "bg-purple-500"
                        : "bg-burgundy-900"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                    <p className="text-[11px] text-slate-500 truncate">{item.sub}</p>
                  </div>
                  <span className="text-[10px] text-frost-600 flex-shrink-0 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Live Contracts Table ──────────────────────────────────────────── */}
      {contracts.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-frost-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Contracts</h2>
              <p className="text-xs text-frost-600 mt-0.5">Latest extracted documents</p>
            </div>
            <Link
              href="/contracts"
              className="flex items-center gap-1 text-xs font-medium text-burgundy-900 hover:text-burgundy-700 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Carrier</th>
                  <th>Policy Type</th>
                  <th>Year</th>
                  <th>Premium</th>
                  <th>Sum Assured</th>
                </tr>
              </thead>
              <tbody>
                {contracts.slice(0, 5).map((c) => (
                  <tr key={c.id}>
                    <td className="font-semibold text-slate-800">{c.carrier || "Unknown"}</td>
                    <td className="text-slate-600">{c.policy_type || "—"}</td>
                    <td className="text-slate-600">{c.policy_year || "—"}</td>
                    <td className="tabular-nums font-medium text-slate-900">
                      {c.premium_amount ? formatUSD(c.premium_amount, false) : "—"}
                    </td>
                    <td className="tabular-nums">
                      {c.sum_assured ? formatUSD(c.sum_assured, true) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
