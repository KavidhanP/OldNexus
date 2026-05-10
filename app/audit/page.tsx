import type { Metadata } from "next";
import { mockAuditScan } from "@/lib/mock-data";
import { riskColor } from "@/lib/utils";
import type { RiskLevel } from "@/types/nexus";
import { AlertTriangle, CheckCircle, FileSearch, Upload, Clock } from "lucide-react";

export const metadata: Metadata = { title: "M&A Red Flag Audit" };

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`badge border ${riskColor(level)}`}>
      {level === "CRITICAL" || level === "HIGH" ? (
        <AlertTriangle className="w-3 h-3" />
      ) : (
        <CheckCircle className="w-3 h-3" />
      )}
      {level}
    </span>
  );
}

const RISK_ORDER: Record<RiskLevel, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export default function AuditPage() {
  const scan = mockAuditScan;
  const sorted = [...scan.results].sort(
    (a, b) => RISK_ORDER[a.risk_level] - RISK_ORDER[b.risk_level]
  );
  const critical = scan.results.filter((r) => r.risk_level === "CRITICAL").length;
  const high = scan.results.filter((r) => r.risk_level === "HIGH").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">M&A Red Flag Audit</h1>
          <p className="page-sub">Automated VDR document scanning for high-risk legal clauses</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Upload className="w-4 h-4" /> Upload VDR Documents
        </button>
      </div>

      {/* Alert banner */}
      {critical > 0 && (
        <div
          className="rounded-2xl p-4 border flex items-start gap-3 animate-fade-in"
          style={{ background: "rgba(220,38,38,0.04)", borderColor: "rgba(220,38,38,0.2)" }}
        >
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">
              {critical} Critical clause{critical > 1 ? "s" : ""} detected — immediate legal review required
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Change of Control provisions may trigger policy termination. Do not proceed to Closing without legal clearance.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Scan metadata */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileSearch className="w-4 h-4 text-burgundy-900" />
              <h2 className="text-sm font-semibold text-slate-800">Scan Details</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-frost-600">Document</p>
                <p className="font-semibold text-slate-800 mt-0.5 leading-snug">{scan.document_name}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-frost-600">Pages Scanned</p>
                  <p className="font-semibold text-slate-800 tabular-nums mt-0.5">{scan.total_pages}</p>
                </div>
                <div className="text-right">
                  <p className="text-frost-600">Status</p>
                  <span className="badge badge-green mt-0.5">
                    <CheckCircle className="w-3 h-3" /> Complete
                  </span>
                </div>
              </div>
              <div>
                <p className="text-frost-600">Scanned At</p>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-frost-400" />
                  {new Date(scan.scanned_at).toLocaleString("en-GB")}
                </p>
              </div>
              <div
                className="rounded-lg p-3 text-[10px] border"
                style={{ background: "rgba(107,11,12,0.04)", borderColor: "rgba(107,11,12,0.12)" }}
              >
                <p className="font-semibold text-burgundy-900">Gemini 1.5 Pro</p>
                <p className="text-frost-600 mt-0.5">Enterprise privacy mode · Data not used for training</p>
              </div>
            </div>
          </div>

          {/* Risk summary */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Risk Summary</h2>
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as RiskLevel[]).map((level) => {
              const count = scan.results.filter((r) => r.risk_level === level).length;
              return (
                <div key={level} className="flex items-center gap-3 mb-3">
                  <RiskBadge level={level} />
                  <div className="flex-1 h-1.5 bg-frost-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(count / scan.results.length) * 100}%`,
                        background:
                          level === "CRITICAL" ? "#dc2626" :
                          level === "HIGH" ? "#ea580c" :
                          level === "MEDIUM" ? "#d97706" : "#10b981",
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 tabular-nums w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results table */}
        <div className="xl:col-span-2 space-y-3">
          {sorted.map((result, i) => (
            <div
              key={result.id}
              className={`card p-4 animate-slide-up border-l-4 ${
                result.risk_level === "CRITICAL"
                  ? "border-l-red-600"
                  : result.risk_level === "HIGH"
                  ? "border-l-orange-500"
                  : result.risk_level === "MEDIUM"
                  ? "border-l-amber-500"
                  : "border-l-emerald-500"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <RiskBadge level={result.risk_level} />
                  <span className="text-sm font-semibold text-slate-800">{result.clause_type}</span>
                </div>
                <span className="text-xs text-frost-600 flex-shrink-0">Page {result.page_number}</span>
              </div>

              {/* Excerpt */}
              <blockquote
                className="text-xs text-slate-600 italic border-l-2 border-frost-200 pl-3 mb-3 leading-relaxed"
              >
                &ldquo;{result.excerpt}&rdquo;
              </blockquote>

              {/* Recommendation */}
              <div
                className="rounded-lg p-3 text-xs"
                style={{ background: "rgba(242,247,249,0.8)" }}
              >
                <p className="font-semibold text-slate-700 mb-0.5">Recommendation</p>
                <p className="text-slate-600 leading-relaxed">{result.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
