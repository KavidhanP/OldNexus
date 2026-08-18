"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Search,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  Zap,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

import { useNexus } from "@/lib/store";

const secondaryItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  if (pathname === "/landing") return null;
  const { state } = useNexus();
  
  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Lead Landing", href: "/landing", icon: GraduationCap },
    { label: "Contracts", href: "/contracts", icon: FileText, badge: state.contracts.length > 0 ? String(state.contracts.length) : undefined },
    { label: "Fortress CRM", href: "/crm", icon: Users },
    { label: "M&A Audit", href: "/audit", icon: Search, badge: state.auditScans.length > 0 ? String(state.auditScans.length) : undefined },
  ];

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex flex-col"
      style={{
        width: "var(--sidebar-width)",
        background: "linear-gradient(180deg, #6b0b0c 0%, #450006 100%)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold rounded-full border-2 border-burgundy-900 animate-pulse-soft" />
        </div>
        <div>
          <p className="text-white font-bold text-sm tracking-wide">NEXUS OS</p>
          <p className="text-white/40 text-[10px] tracking-widest uppercase">MSA Group Holdings</p>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold px-3 pb-2 pt-1">
          Platform
        </p>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-link group",
                isActive && "active"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold bg-white/20 text-white/80 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 text-white/60" />}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold px-3 pb-2">
            System
          </p>
          {secondaryItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("nav-link", isActive && "active")}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Compliance Badge ──────────────────────────────────────────────── */}
      <div className="px-3 py-3">
        <div
          className="rounded-xl px-3 py-2.5 border border-white/10 flex items-start gap-2"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <Shield className="w-3.5 h-3.5 text-gold mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-white/70">Enterprise Privacy</p>
            <p className="text-[9px] text-white/40 leading-tight">Gemini data isolation active</p>
          </div>
        </div>
      </div>

      {/* ── User Footer ───────────────────────────────────────────────────── */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center flex-shrink-0">
            <span className="text-gold text-xs font-bold">JO</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">James Osei</p>
            <p className="text-white/40 text-[10px] truncate">Senior Broker</p>
          </div>
          <button className="text-white/40 hover:text-white transition-colors" title="Log out">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
