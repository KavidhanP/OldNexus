"use client";

import { useRef, useState } from "react";
import { useNexus } from "@/lib/store";
import { riskColor } from "@/lib/utils";
import type { RiskLevel, AuditScan } from "@/types/nexus";
import {
  AlertTriangle, CheckCircle, FileSearch, Upload,
  Clock, Loader2, FileX, ChevronDown, ChevronUp,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const RISK_ORDER: Record<RiskLevel, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

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

function ScanPanel({ scan }: { scan: AuditScan }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<RiskLevel | "ALL">("ALL");

  const filtered = selectedFilter === "ALL"
    ? scan.results
    : scan.results.filter((r) => r.risk_level === selectedFilter);

  const sorted = [...filtered].sort(
    (a, b) => RISK_ORDER[a.risk_level] - RISK_ORDER[b.risk_level]
  );
  const critical = scan.results.filter((r) => r.risk_level === "CRITICAL").length;
  const high = scan.results.filter((r) => r.risk_level === "HIGH").length;

  return (
    <div className="card overflow-hidden animate-fade-in">
      {/* Scan header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 border-b border-frost-100 flex items-center justify-between hover:bg-frost-50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <FileSearch className="w-4 h-4 text-burgundy-900 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">
              {scan.document_name}
            </p>
            <p className="text-xs text-frost-500 mt-0.5">
              {scan.total_pages} pages · {scan.results.length} flag{scan.results.length !== 1 ? "s" : ""} ·{" "}
              {new Date(scan.scanned_at).toLocaleString("en-GB")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {critical > 0 && (
            <span className="badge border badge-red">
              <AlertTriangle className="w-3 h-3" /> {critical} Critical
            </span>
          )}
          {high > 0 && (
            <span className="badge border bg-orange-50 text-orange-700 border-orange-200">
              <AlertTriangle className="w-3 h-3" /> {high} High
            </span>
          )}
          <span className="badge border badge-green">
            <CheckCircle className="w-3 h-3" /> Complete
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-frost-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-frost-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-5 space-y-5">
          {/* Critical alert banner */}
          {critical > 0 && (
            <div
              className="rounded-2xl p-4 border flex items-start gap-3"
              style={{ background: "rgba(220,38,38,0.04)", borderColor: "rgba(220,38,38,0.2)" }}
            >
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">
                  {critical} Critical clause{critical > 1 ? "s" : ""} detected — immediate legal review required
                </p>
                <p className="text-xs text-red-500 mt-0.5">
                  Do not proceed to Closing without legal clearance on Change of Control provisions.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Risk summary sidebar */}
            <div className="space-y-4">
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">Risk Summary</h3>
                  {selectedFilter !== "ALL" && (
                    <button
                      onClick={() => setSelectedFilter("ALL")}
                      className="text-[10px] text-burgundy-900 hover:underline font-medium"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setSelectedFilter("ALL")}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium mb-2 transition-colors ${
                    selectedFilter === "ALL" ? "bg-burgundy-900/10 text-burgundy-900 border border-burgundy-900/20" : "hover:bg-frost-50 text-slate-700"
                  }`}
                >
                  <span>All Findings</span>
                  <span className="font-bold">{scan.results.length}</span>
                </button>

                {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as RiskLevel[]).map((level) => {
                  const count = scan.results.filter((r) => r.risk_level === level).length;
                  const total = scan.results.length || 1;
                  const isSelected = selectedFilter === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedFilter(isSelected ? "ALL" : level)}
                      className={`w-full flex items-center gap-3 p-1.5 rounded-lg text-left transition-colors ${
                        isSelected ? "bg-frost-100 ring-1 ring-burgundy-900/30" : "hover:bg-frost-50"
                      }`}
                    >
                      <RiskBadge level={level} />
                      <div className="flex-1 h-1.5 bg-frost-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(count / total) * 100}%`,
                            background:
                              level === "CRITICAL" ? "#dc2626" :
                              level === "HIGH" ? "#ea580c" :
                              level === "MEDIUM" ? "#d97706" : "#10b981",
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 tabular-nums w-4">{count}</span>
                    </button>
                  );
                })}
              </div>
              {/* Model badge */}
              <div
                className="rounded-2xl p-3 text-[10px] border"
                style={{ background: "rgba(107,11,12,0.04)", borderColor: "rgba(107,11,12,0.12)" }}
              >
                <p className="font-semibold text-burgundy-900">Groq llama-3.3-70b-versatile</p>
                <p className="text-frost-600 mt-0.5">Enterprise privacy mode · Data not used for training</p>
              </div>
            </div>

            {/* Red flag results */}
            <div className="xl:col-span-2 space-y-3">
              {sorted.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-frost-200 rounded-xl">
                  <p className="text-xs text-frost-500">No findings matched severity filter: {selectedFilter}</p>
                </div>
              ) : (
                sorted.map((result, i) => (
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
                    <blockquote className="text-xs text-slate-600 italic border-l-2 border-frost-200 pl-3 mb-3 leading-relaxed">
                      &ldquo;{result.excerpt}&rdquo;
                    </blockquote>
                    <div
                      className="rounded-lg p-3 text-xs"
                      style={{ background: "rgba(242,247,249,0.8)" }}
                    >
                      <p className="font-semibold text-slate-700 mb-0.5">Recommendation</p>
                      <p className="text-slate-600 leading-relaxed">{result.recommendation}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuditPage() {
  const { state, addAuditScan } = useNexus();
  const { auditScans } = state;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setScanError("Only PDF files are accepted.");
      return;
    }

    setScanning(true);
    setScanError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/audit/scan`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Scan failed (${res.status}): ${errText}`);
      }

      const json = await res.json();
      // Normalise the backend shape → AuditScan type
      const scanData = json.data as { document_name: string; total_pages: number; results: AuditScan["results"] };
      const scan: AuditScan = {
        id: json.scan_id,
        document_name: scanData.document_name,
        total_pages: scanData.total_pages,
        status: "COMPLETE",
        results: scanData.results,
        scanned_at: json.scanned_at,
      };

      addAuditScan(scan);
    } catch (err: unknown) {
      setScanError(err instanceof Error ? err.message : "Scan failed. Please try again.");
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">M&A Red Flag Audit</h1>
          <p className="page-sub">Automated VDR document scanning for high-risk legal clauses</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Scanning…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Upload VDR Document
              </>
            )}
          </button>
          {scanError && (
            <p className="text-xs text-red-600 max-w-xs text-right">{scanError}</p>
          )}
          {scanning && (
            <p className="text-xs text-frost-500 text-right">
              Groq is analysing your document for red flags…
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Empty state */}
      {auditScans.length === 0 && !scanning && (
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-frost-50 flex items-center justify-center mb-4">
            <FileX className="w-8 h-8 text-frost-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-700">No scans yet</h2>
          <p className="text-sm text-frost-500 mt-2 max-w-sm">
            Upload a VDR PDF document using the button above. Groq will scan every clause and flag
            CRITICAL, HIGH, MEDIUM and LOW risk items automatically.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary mt-6 text-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Upload your first document
          </button>
        </div>
      )}

      {/* Scanning in-progress placeholder */}
      {scanning && (
        <div className="card p-8 flex flex-col items-center justify-center text-center animate-fade-in">
          <Loader2 className="w-10 h-10 text-burgundy-900 animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-700">Scanning document…</p>
          <p className="text-xs text-frost-500 mt-1">
            Groq llama-3.3-70b-versatile is analysing all clauses. This may take 15–30 seconds.
          </p>
        </div>
      )}

      {/* Scan results — most recent first */}
      {auditScans.map((scan) => (
        <ScanPanel key={scan.id} scan={scan} />
      ))}

      {/* Session summary bar */}
      {auditScans.length > 0 && (
        <div className="card p-4 flex items-center gap-6 flex-wrap animate-fade-in">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-frost-400" />
            <span className="text-xs text-frost-600 font-medium">Session Summary</span>
          </div>
          <div className="flex gap-6">
            {[
              { label: "Scans", value: auditScans.length },
              {
                label: "Critical",
                value: auditScans.reduce(
                  (a, s) => a + s.results.filter((r) => r.risk_level === "CRITICAL").length,
                  0
                ),
                red: true,
              },
              {
                label: "Total Flags",
                value: auditScans.reduce((a, s) => a + s.results.length, 0),
              },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold tabular-nums ${s.red ? "text-red-600" : "text-slate-800"}`}>
                  {s.value}
                </p>
                <p className="text-[10px] text-frost-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
