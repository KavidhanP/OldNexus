"use client";

import { useNexus } from "@/lib/store";
import { GitCompare, ArrowLeft, ChevronRight, Scale, FileText } from "lucide-react";
import Link from "next/link";

export default function CompareIndexPage() {
  const { state } = useNexus();
  const { deltaReports, contracts } = state;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back navigation */}
      <Link
        href="/contracts"
        className="flex items-center gap-1.5 text-xs text-frost-600 hover:text-burgundy-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Contracts
      </Link>

      {/* Header */}
      <div>
        <h1 className="page-header flex items-center gap-2">
          <Scale className="w-6 h-6 text-burgundy-900" />
          Contract Comparison Center
        </h1>
        <p className="page-sub">View generated delta reports or select versioned policies to audit inflation changes</p>
      </div>

      {/* Recent reports list */}
      {deltaReports.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Generated Premium Delta Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deltaReports.map((report) => (
              <Link
                key={report.id}
                href={`/contracts/compare/${report.id}`}
                className="card p-5 hover:border-burgundy-900/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="badge badge-purple flex items-center gap-1">
                      <GitCompare className="w-3 h-3" /> Delta Report
                    </span>
                    <span className="text-[10px] text-frost-500">
                      {new Date(report.generated_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-burgundy-900 transition-colors">
                    {report.carrier_a} — {report.contract_a_year} vs {report.contract_b_year}
                  </h3>
                  <p className="text-xs text-frost-600 mt-1">
                    {report.summary.discrepancies} discrepancies · {report.summary.watches} watch items flagged
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-frost-100 flex items-center justify-between text-xs font-semibold text-burgundy-900">
                  <span>View Side-by-Side Matrix</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-frost-50 flex items-center justify-center mb-4">
            <GitCompare className="w-7 h-7 text-burgundy-900" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">No Delta Reports Generated Yet</h2>
          <p className="text-xs text-frost-500 mt-1 max-w-sm">
            To compare policies, navigate to Contracts, select two uploaded contracts from the table, and click &quot;Generate Delta Report&quot;.
          </p>
          <Link href="/contracts" className="btn-primary mt-6 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" /> Go to Contracts Page
          </Link>
        </div>
      )}
    </div>
  );
}
