"use client";

import { useNexus } from "@/lib/store";
import DeltaTable from "@/components/contracts/DeltaTable";
import { ArrowLeft, Download, Share2, FileX } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompareReportPage({ params }: PageProps) {
  const { id } = use(params);
  const { state } = useNexus();
  const report = state.deltaReports.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="max-w-6xl mx-auto">
        <Link
          href="/contracts"
          className="flex items-center gap-1.5 text-xs text-frost-600 hover:text-burgundy-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Contracts
        </Link>
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-frost-50 flex items-center justify-center mb-4">
            <FileX className="w-8 h-8 text-frost-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-700">Report not found</h2>
          <p className="text-sm text-frost-500 mt-2 max-w-sm">
            This delta report doesn&apos;t exist in the current session. Generate one by selecting two contracts and clicking &quot;Generate Delta Report&quot;.
          </p>
          <Link href="/contracts" className="btn-primary mt-6 text-sm">
            Go to Contracts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/contracts"
            className="flex items-center gap-1.5 text-xs text-frost-600 hover:text-burgundy-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Contracts
          </Link>
          <h1 className="page-header">Premium Delta Report</h1>
          <p className="page-sub">
            {report.carrier_a} · {report.contract_a_year} vs {report.contract_b_year} · Generated{" "}
            {new Date(report.generated_at).toLocaleDateString("en-GB")}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost flex items-center gap-2 text-sm">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Model badge */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
        style={{
          background: "rgba(107,11,12,0.05)",
          borderColor: "rgba(107,11,12,0.15)",
          color: "#6b0b0c",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-burgundy-900 animate-pulse-soft" />
        Processed by Groq llama-3.3-70b-versatile + Pandas Normalization Engine
      </div>

      <DeltaTable report={report} />
    </div>
  );
}
