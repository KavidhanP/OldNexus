import type { Metadata } from "next";
import DeltaTable from "@/components/contracts/DeltaTable";
import { mockDeltaReport } from "@/lib/mock-data";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Delta Report" };

interface PageProps {
  params: { id: string };
}

export default function CompareReportPage({ params }: PageProps) {
  // In production: fetch report by params.id from FastAPI
  const report = mockDeltaReport;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/contracts" className="flex items-center gap-1.5 text-xs text-frost-600 hover:text-burgundy-900 transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Contracts
          </Link>
          <h1 className="page-header">Premium Delta Report</h1>
          <p className="page-sub">
            {report.carrier_a} · {report.contract_a_year} vs {report.contract_b_year} · Generated {new Date(report.generated_at).toLocaleDateString("en-GB")}
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

      {/* Skill badge */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
        style={{
          background: "rgba(107,11,12,0.05)",
          borderColor: "rgba(107,11,12,0.15)",
          color: "#6b0b0c",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-burgundy-900 animate-pulse-soft" />
        Processed by Gemini 1.5 Pro + Pandas Normalization Engine
      </div>

      <DeltaTable report={report} />
    </div>
  );
}
