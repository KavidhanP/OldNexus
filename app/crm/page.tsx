import type { Metadata } from "next";
import ClientCard from "@/components/crm/ClientCard";
import { mockClients } from "@/lib/mock-data";
import { Users, Search, Plus } from "lucide-react";

export const metadata: Metadata = { title: "Fortress CRM" };

export default function CRMPage() {
  const totalNW = mockClients.reduce((s, c) => s + c.net_worth_usd, 0);
  const totalContracts = mockClients.reduce((s, c) => s + c.contract_count, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">Fortress CRM</h1>
          <p className="page-sub">Centralized HNWI client intelligence and asset allocation tracker</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Clients", value: mockClients.length.toString(), icon: Users },
          { label: "AUM Under Management", value: `$${(totalNW / 1e6).toFixed(1)}M`, icon: null },
          { label: "Total Contracts", value: totalContracts.toString(), icon: null },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-frost-600">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-frost-400" />
        <input
          type="search"
          placeholder="Search clients, relationship managers..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-frost-200 bg-white text-sm text-slate-700
                     placeholder:text-frost-400 focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900/20
                     transition-all"
        />
      </div>

      {/* Client grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {mockClients.map((client, i) => (
          <div key={client.id} style={{ animationDelay: `${i * 60}ms` }}>
            <ClientCard client={client} />
          </div>
        ))}
      </div>
    </div>
  );
}
