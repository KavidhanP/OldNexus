"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNexus } from "@/lib/store";
import type { ExtractedContractEntry } from "@/lib/store";
import type { DeltaReport } from "@/types/nexus";
import UploadZone from "@/components/contracts/UploadZone";
import {
  FileText, GitCompare, CheckCircle, Clock, AlertTriangle,
  ArrowRight, Loader2, ChevronRight, Scale, Search,
} from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "badge-blue",
    EXTRACTING: "badge-amber",
    EXTRACTED: "badge-green",
    COMPARED: "bg-purple-50 text-purple-700 border border-purple-200 badge",
    ERROR: "badge-red",
  };
  const icons: Record<string, React.ElementType> = {
    PENDING: Clock,
    EXTRACTED: CheckCircle,
    COMPARED: GitCompare,
    ERROR: AlertTriangle,
  };
  const Icon = icons[status] ?? Clock;
  return (
    <span className={`badge ${map[status] ?? "badge-blue"}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function ContractsPage() {
  const { state, addContract, addDeltaReport } = useNexus();
  const { contracts, deltaReports } = state;
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [contractSearch, setContractSearch] = useState("");

  // ── Handle upload success ─────────────────────────────────────────────────
  const handleUploadSuccess = (raw: Record<string, unknown>) => {
    const entry: ExtractedContractEntry = {
      id: (raw.id as string) ?? `ctr-${Date.now()}`,
      original_filename: (raw.original_filename as string) ?? "Uploaded Contract",
      carrier: (raw.carrier as string) ?? null,
      policy_year: (raw.policy_year as number) ?? null,
      premium_amount: (raw.premium_amount as number) ?? null,
      policy_type: (raw.policy_type as string) ?? null,
      sum_assured: (raw.sum_assured as number) ?? null,
      extractedAt: new Date().toISOString(),
      raw,
    };
    addContract(entry);
  };

  // ── Toggle row selection ──────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 2) {
          // Keep only the latest selected + this new one
          const arr = Array.from(next);
          next.clear();
          next.add(arr[arr.length - 1]);
        }
        next.add(id);
      }
      return next;
    });
    setCompareError(null);
  };

  // ── Run comparison ────────────────────────────────────────────────────────
  const runCompare = async () => {
    const [idA, idB] = Array.from(selectedIds);
    if (!idA || !idB) return;

    const cA = contracts.find((c) => c.id === idA);
    const cB = contracts.find((c) => c.id === idB);
    if (!cA || !cB) {
      setCompareError("Could not find selected contracts. Please re-upload them.");
      return;
    }

    setComparing(true);
    setCompareError(null);

    try {
      const formData = new FormData();
      formData.append("contract_a", JSON.stringify(cA.raw));
      formData.append("contract_b", JSON.stringify(cB.raw));

      const res = await fetch(`${API}/contracts/compare`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Compare failed (${res.status}): ${errText}`);
      }

      const json = await res.json();
      const report: DeltaReport = json.data;
      await addDeltaReport(report);

      // Use router.push so React context stays alive (no full page reload)
      router.push(`/contracts/compare/${report.id}`);
    } catch (err: unknown) {
      setCompareError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setComparing(false);
    }
  };

  const contractA = contracts.find((c) => selectedIds.has(c.id));
  const contractB = contracts.find((c) => selectedIds.has(c.id) && c.id !== contractA?.id);
  const canCompare = selectedIds.size === 2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="page-header">Versioned Contract Engine</h1>
        <p className="page-sub">Upload PDF contracts for AI extraction and premium delta analysis</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-1 space-y-4">
          {/* Upload zone */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-burgundy-900" />
              Upload Contracts
            </h2>
            <UploadZone onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Compare panel */}
          {contracts.length >= 2 && (
            <div className="card p-5 space-y-3 animate-fade-in">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Scale className="w-4 h-4 text-burgundy-900" />
                Compare Contracts
              </h2>
              <p className="text-xs text-frost-600">
                Select exactly <strong>2 contracts</strong> from the table to generate a premium delta report.
              </p>

              {canCompare && (
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-medium text-slate-500">Selected:</p>
                  <p className="truncate">A: {contractA?.original_filename}</p>
                  <p className="truncate">B: {contractB?.original_filename}</p>
                </div>
              )}

              {compareError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{compareError}</p>
              )}

              <button
                onClick={runCompare}
                disabled={!canCompare || comparing}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {comparing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Running Analysis…
                  </>
                ) : (
                  <>
                    <GitCompare className="w-4 h-4" /> Generate Delta Report
                  </>
                )}
              </button>
            </div>
          )}

          {/* Past delta reports */}
          {deltaReports.length > 0 && (
            <div className="card p-5 space-y-2 animate-fade-in">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Delta Reports</h2>
              {deltaReports.map((r) => (
                <Link
                  key={r.id}
                  href={`/contracts/compare/${r.id}`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-frost-50 transition-colors group"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      {r.carrier_a} · {r.contract_a_year} vs {r.contract_b_year}
                    </p>
                    <p className="text-[11px] text-frost-600 mt-0.5">
                      {r.summary.discrepancies} discrepanc{r.summary.discrepancies !== 1 ? "ies" : "y"}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-frost-400 group-hover:text-burgundy-900 transition-colors" />
                </Link>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-800">Session Stats</h2>
            {[
              { label: "Contracts Extracted", value: contracts.length, color: "bg-burgundy-900" },
              { label: "Delta Reports Generated", value: deltaReports.length, color: "bg-purple-500" },
              {
                label: "Discrepancies Found",
                value: deltaReports.reduce((acc, r) => acc + r.summary.discrepancies, 0),
                color: "bg-red-500",
              },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-xs text-slate-600 flex-1">{s.label}</span>
                <span className="text-xs font-bold text-slate-800 tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contract history table */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-frost-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Contract History
                {contracts.length > 0 && (
                  <span className="ml-2 text-xs text-frost-500 font-normal">
                    — select 2 for comparison
                  </span>
                )}
              </h2>
            </div>
            
            {contracts.length > 0 && (
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-frost-400" />
                <input
                  type="search"
                  value={contractSearch}
                  onChange={(e) => setContractSearch(e.target.value)}
                  placeholder="Filter contracts..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-frost-200 bg-white text-xs text-slate-700
                             placeholder:text-frost-400 focus:outline-none focus:border-burgundy-900"
                />
              </div>
            )}
          </div>

          {contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-frost-50 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-frost-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600">No contracts yet</p>
              <p className="text-xs text-frost-500 mt-1 max-w-xs">
                Upload a PDF insurance contract using the panel on the left. Groq will extract all key fields automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-8">Select</th>
                    <th>Contract</th>
                    <th>Carrier</th>
                    <th>Year</th>
                    <th>Premium (p.a.)</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {contracts
                    .filter(
                      (c) =>
                        c.original_filename.toLowerCase().includes(contractSearch.toLowerCase()) ||
                        (c.carrier && c.carrier.toLowerCase().includes(contractSearch.toLowerCase()))
                    )
                    .map((c) => {
                      const isSelected = selectedIds.has(c.id);
                      return (
                        <tr
                          key={c.id}
                          onClick={() => toggleSelect(c.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-burgundy-900/5 border-l-2 border-l-burgundy-900"
                              : "hover:bg-frost-50"
                          }`}
                        >
                          <td className="text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(c.id)}
                              className="w-4 h-4 rounded text-burgundy-900 focus:ring-burgundy-900 cursor-pointer"
                            />
                          </td>
                          <td className="font-medium text-slate-800 max-w-[200px] truncate">
                            {c.original_filename}
                          </td>
                          <td className="text-slate-500">{c.carrier ?? "—"}</td>
                          <td className="tabular-nums">{c.policy_year ?? "—"}</td>
                          <td className="tabular-nums">
                            {c.premium_amount
                              ? `$${c.premium_amount.toLocaleString("en-US")}`
                              : <span className="text-slate-400">—</span>}
                          </td>
                          <td><StatusBadge status="EXTRACTED" /></td>
                          <td>
                            {deltaReports.some(
                              (r) => r.contract_a_id === c.id || r.contract_b_id === c.id
                            ) && (
                              <Link
                                href={`/contracts/compare/${
                                  deltaReports.find(
                                    (r) => r.contract_a_id === c.id || r.contract_b_id === c.id
                                  )?.id
                                }`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-xs font-medium text-burgundy-900 hover:text-burgundy-700"
                              >
                                View Report <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
