"use client";

import { useState } from "react";
import ClientCard from "@/components/crm/ClientCard";
import { mockClients } from "@/lib/mock-data";
import { Users, Search, Plus, Filter } from "lucide-react";

export default function CRMPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");

  const totalNW = mockClients.reduce((s, c) => s + c.net_worth_usd, 0);
  const totalContracts = mockClients.reduce((s, c) => s + c.contract_count, 0);

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.relationship_manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      riskFilter === "ALL" || client.risk_profile.toUpperCase().includes(riskFilter);
    return matchesSearch && matchesRisk;
  });

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

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-frost-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients, relationship managers..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-frost-200 bg-white text-sm text-slate-700
                       placeholder:text-frost-400 focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900/20
                       transition-all"
          />
        </div>
        
        {/* Risk profile filters */}
        <div className="flex items-center gap-1.5 bg-frost-50 p-1 rounded-xl border border-frost-200 text-xs w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-frost-500 ml-2 mr-1 hidden md:block" />
          {["ALL", "CONSERVATIVE", "BALANCED", "GROWTH"].map((tag) => (
            <button
              key={tag}
              onClick={() => setRiskFilter(tag)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                riskFilter === tag
                  ? "bg-burgundy-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {tag === "ALL" ? "All Profiles" : tag.charAt(0) + tag.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Client grid */}
      {filteredClients.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm font-semibold text-slate-600">No clients match your filter</p>
          <p className="text-xs text-frost-500 mt-1">Try clearing your search query or selecting &quot;All Profiles&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredClients.map((client, i) => (
            <div key={client.id} style={{ animationDelay: `${i * 60}ms` }}>
              <ClientCard client={client} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
