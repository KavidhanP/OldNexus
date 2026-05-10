import type { Client } from "@/types/nexus";
import { formatUSD } from "@/lib/utils";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ClientCardProps {
  client: Client;
}

const RISK_STYLES: Record<string, string> = {
  CONSERVATIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  BALANCED: "bg-amber-50 text-amber-700 border-amber-200",
  AGGRESSIVE: "bg-red-50 text-red-700 border-red-200",
};

export default function ClientCard({ client }: ClientCardProps) {
  const topAllocation = [...client.allocations].sort((a, b) => b.percentage - a.percentage)[0];

  return (
    <div className="card-hover p-5 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6b0b0c, #450006)" }}
          >
            {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{client.name}</p>
            <p className="text-[11px] text-frost-600">{client.relationship_manager}</p>
          </div>
        </div>
        <span className={`badge border ${RISK_STYLES[client.risk_profile]}`}>
          {client.risk_profile.charAt(0) + client.risk_profile.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Net worth */}
      <div className="mb-4">
        <p className="text-[10px] text-frost-600 uppercase tracking-wider">Net Worth</p>
        <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
          {formatUSD(client.net_worth_usd, true)}
        </p>
      </div>

      {/* Allocation bars */}
      <div className="space-y-1.5 mb-4">
        {client.allocations.map((a) => (
          <div key={a.asset_class} className="flex items-center gap-2">
            <span className="text-[10px] text-frost-600 w-14">{a.asset_class}</span>
            <div className="flex-1 h-1.5 bg-frost-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${a.percentage}%`,
                  background:
                    a.asset_class === "GOLD"
                      ? "#d4a843"
                      : a.asset_class === "EQUITY"
                      ? "#6b0b0c"
                      : a.asset_class === "PE"
                      ? "#2563eb"
                      : "#94a3b8",
                }}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-700 tabular-nums w-8 text-right">{a.percentage}%</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-frost-100">
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <FileText className="w-3 h-3" />
          {client.contract_count} contracts
        </div>
        <Link
          href={`/crm/${client.id}`}
          className="flex items-center gap-1 text-xs font-medium text-burgundy-900 hover:text-burgundy-700 transition-colors"
        >
          View profile <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
