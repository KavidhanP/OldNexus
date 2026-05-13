"use client";

import { useState } from "react";
import UploadZone from "@/components/contracts/UploadZone";
import { FileText, GitCompare, CheckCircle, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

const mockContracts = [
  { id: "ctr-2018-001", name: "Prudential Life — Whole Life 2018", carrier: "Prudential Life", year: 2018, client: "Mohammed Al-Rashid", status: "EXTRACTED", premium: 48000 },
  { id: "ctr-2024-001", name: "Prudential Life — Whole Life 2024", carrier: "Prudential Life", year: 2024, client: "Mohammed Al-Rashid", status: "COMPARED", premium: 64416 },
  { id: "ctr-2019-002", name: "Old Mutual — Endowment 2019", carrier: "Old Mutual", year: 2019, client: "Kwame Asante-Boateng", status: "EXTRACTED", premium: 72000 },
  { id: "ctr-2023-003", name: "Discovery Life — Income Protector 2023", carrier: "Discovery Life", year: 2023, client: "Adaeze Okonkwo", status: "PENDING", premium: null },
  { id: "ctr-2021-004", name: "Liberty Life — Term 20 2021", carrier: "Liberty Life", year: 2021, client: "Fatima Al-Mansouri", status: "EXTRACTED", premium: 38400 },
];

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
  const [contracts, setContracts] = useState(mockContracts);

  const handleUploadSuccess = (extractedData: any) => {
    const newContract = {
      id: extractedData.id || `ctr-new-${Date.now()}`,
      name: extractedData.original_filename || "Newly Uploaded Contract",
      carrier: extractedData.carrier || "Unknown Carrier",
      year: extractedData.policy_year || new Date().getFullYear(),
      client: "New Client", // Could be extracted or assigned later
      status: "EXTRACTED",
      premium: extractedData.premium_amount || null,
    };
    
    // Add to the top of the list
    setContracts((prev) => [newContract, ...prev]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="page-header">Versioned Contract Engine</h1>
        <p className="page-sub">Upload PDF contracts (2018–2026) for AI extraction and premium delta analysis</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upload zone */}
        <div className="xl:col-span-1 space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-burgundy-900" />
              Upload Contracts
            </h2>
              <UploadZone onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Quick stats */}
          <div className="card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-800">Extraction Stats</h2>
            {[
              { label: "Total Uploaded", value: "247", color: "bg-burgundy-900" },
              { label: "Successfully Extracted", value: "231", color: "bg-emerald-500" },
              { label: "Discrepancies Found", value: "38", color: "bg-red-500" },
              { label: "Pending Processing", value: "16", color: "bg-amber-400" },
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
          <div className="px-5 py-4 border-b border-frost-100">
            <h2 className="text-sm font-semibold text-slate-800">Contract History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Carrier</th>
                  <th>Year</th>
                  <th>Client</th>
                  <th>Premium (p.a.)</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-slate-800 max-w-[160px] truncate">{c.name}</td>
                    <td className="text-slate-500">{c.carrier}</td>
                    <td className="tabular-nums">{c.year}</td>
                    <td className="text-slate-600">{c.client}</td>
                    <td className="tabular-nums">
                      {c.premium
                        ? `$${c.premium.toLocaleString("en-US")}`
                        : <span className="text-slate-400">—</span>}
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      {c.status === "COMPARED" && (
                        <Link
                          href={`/contracts/compare/dr-001`}
                          className="flex items-center gap-1 text-xs font-medium text-burgundy-900 hover:text-burgundy-700"
                        >
                          View Report <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
