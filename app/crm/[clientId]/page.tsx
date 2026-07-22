import type { Metadata } from "next";
import AllocationChart from "@/components/crm/AllocationChart";
import { mockClients } from "@/lib/mock-data";
import { formatUSD } from "@/lib/utils";
import { ArrowLeft, Download, Mail, Phone, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ clientId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clientId } = await params;
  const client = mockClients.find((c) => c.id === clientId);
  return { title: client ? client.name : "Client" };
}

const ASSET_COLORS: Record<string, string> = {
  GOLD: "#d4a843",
  EQUITY: "#6b0b0c",
  PE: "#2563eb",
  CASH: "#94a3b8",
};

export default async function ClientDetailPage({ params }: PageProps) {
  const { clientId } = await params;
  const client = mockClients.find((c) => c.id === clientId);
  if (!client) notFound();

  const topAsset = [...client.allocations].sort((a, b) => b.percentage - a.percentage)[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back link */}
      <Link href="/crm" className="flex items-center gap-1.5 text-xs text-frost-600 hover:text-burgundy-900 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to CRM
      </Link>

      {/* Client hero */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6b0b0c 0%, #450006 100%)" }}
      >
        {/* Background decoration */}
        <div
          className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10"
          style={{ background: "white" }}
        />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-2 border-white/20"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <p className="text-white/60 text-sm mt-0.5">Relationship Manager: {client.relationship_manager}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge bg-white/15 text-white border border-white/20">
                  {client.risk_profile}
                </span>
                <span className="badge bg-white/15 text-white border border-white/20">
                  {client.contract_count} contracts
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Total Net Worth</p>
            <p className="text-3xl font-bold tabular-nums mt-1">{formatUSD(client.net_worth_usd, true)}</p>
          </div>
        </div>

        {/* Contact icons */}
        <div className="flex gap-2 mt-4">
          {[
            { icon: Mail, label: "Email client" },
            { icon: Phone, label: "Call client" },
            { icon: Download, label: "Export Wealth Alpha Report" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              {label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Allocation chart */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Asset Allocation</h2>
          <p className="text-[11px] text-frost-600 mb-4">As of 30 April 2026</p>
          <AllocationChart allocations={client.allocations} />
          <div className="space-y-2 mt-2">
            {client.allocations.map((a) => (
              <div key={a.asset_class} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: ASSET_COLORS[a.asset_class] ?? "#94a3b8" }} />
                  <span className="text-slate-600">{a.asset_class}</span>
                </div>
                <div className="flex gap-3 tabular-nums">
                  <span className="text-slate-500">{a.percentage}%</span>
                  <span className="font-semibold text-slate-800">{formatUSD(a.value_usd, true)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Associated contracts */}
        <div className="xl:col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-burgundy-900" />
            Associated Contracts
          </h2>
          <div className="space-y-3">
            {Array.from({ length: client.contract_count }).slice(0, 4).map((_, i) => {
              const year = 2018 + i * 2;
              const premium = 40000 + i * 8000;
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-frost-50 border border-frost-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Policy {year.toString()} — Whole Life</p>
                      <p className="text-[10px] text-frost-600">Premium: {formatUSD(premium)} p.a.</p>
                    </div>
                  </div>
                  <span className="badge badge-green">Extracted</span>
                </div>
              );
            })}
          </div>
          {client.contract_count > 4 && (
            <p className="text-xs text-frost-600 mt-3 text-center">+{client.contract_count - 4} more contracts</p>
          )}

          {/* Wealth Alpha teaser */}
          <div
            className="mt-6 rounded-xl p-4 border flex items-start gap-3"
            style={{ background: "rgba(212,168,67,0.06)", borderColor: "rgba(212,168,67,0.3)" }}
          >
            <span className="text-gold text-lg">✦</span>
            <div>
              <p className="text-sm font-semibold text-slate-800">Wealth Alpha Report</p>
              <p className="text-xs text-slate-500 mt-0.5">
                AI-generated summary justifying brokerage fees through portfolio CAGR, premium efficiency, and benchmark comparison.
              </p>
              <button className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold-dark transition-colors">
                <Download className="w-3.5 h-3.5" /> Generate & Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
