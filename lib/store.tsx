"use client";

/**
 * Nexus OS — Global Application Store (Supabase-backed)
 * Provides shared state for contracts, delta reports, audit scans and activity across all pages.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { DeltaReport, AuditScan } from "@/types/nexus";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExtractedContractEntry {
  id: string;
  original_filename: string;
  carrier: string | null;
  policy_year: number | null;
  premium_amount: number | null;
  policy_type: string | null;
  sum_assured: number | null;
  extractedAt: string;
  raw: Record<string, unknown>;
}

export interface ActivityEvent {
  id: string;
  label: string;
  sub: string;
  time: string;
  type: "contract" | "alert" | "audit" | "crm" | "compare";
  created_at?: string;
}

export interface NexusState {
  contracts: ExtractedContractEntry[];
  deltaReports: DeltaReport[];
  auditScans: AuditScan[];
  activity: ActivityEvent[];
}

// ── Context ───────────────────────────────────────────────────────────────────

interface NexusContextValue {
  state: NexusState;
  addContract: (contract: ExtractedContractEntry) => Promise<void>;
  addDeltaReport: (report: DeltaReport) => Promise<void>;
  addAuditScan: (scan: AuditScan) => Promise<void>;
}

const NexusContext = createContext<NexusContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function NexusProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NexusState>({
    contracts: [],
    deltaReports: [],
    auditScans: [],
    activity: [],
  });

  // Fetch initial data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: contractsData },
          { data: deltaData },
          { data: auditData },
          { data: activityData }
        ] = await Promise.all([
          supabase.from("contracts").select("*").order("extractedAt", { ascending: false }),
          supabase.from("delta_reports").select("*").order("generated_at", { ascending: false }),
          supabase.from("audit_scans").select("*").order("scanned_at", { ascending: false }),
          supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(20)
        ]);

        setState({
          contracts: contractsData || [],
          deltaReports: deltaData || [],
          auditScans: auditData || [],
          activity: activityData || [],
        });
      } catch (err) {
        console.error("Failed to load initial data from Supabase", err);
      }
    }
    loadData();
  }, []);

  const addActivity = async (event: Omit<ActivityEvent, "id" | "created_at">) => {
    const id = `act-${Date.now()}`;
    const newActivity: ActivityEvent = { ...event, id, created_at: new Date().toISOString() };
    
    // Optimistic update
    setState((prev) => ({
      ...prev,
      activity: [newActivity, ...prev.activity].slice(0, 20),
    }));

    const { error } = await supabase.from("activity").insert(newActivity);
    if (error) console.warn("[Supabase] activity insert failed:", error.message);
  };

  const addContract = useCallback(async (contract: ExtractedContractEntry) => {
    // Optimistic update — show immediately in UI
    setState((prev) => ({
      ...prev,
      contracts: [contract, ...prev.contracts],
    }));

    const { error } = await supabase.from("contracts").insert(contract);
    if (error) console.warn("[Supabase] contracts insert failed:", error.message);
    
    await addActivity({
      label: "Contract extracted",
      sub: `${contract.carrier ?? "Unknown"} · ${contract.original_filename}`,
      time: "just now",
      type: "contract",
    });
  }, []);

  const addDeltaReport = useCallback(async (report: DeltaReport) => {
    setState((prev) => ({
      ...prev,
      deltaReports: [report, ...prev.deltaReports],
    }));

    const { error } = await supabase.from("delta_reports").insert(report);
    if (error) console.warn("[Supabase] delta_reports insert failed:", error.message);
    
    const discrepancies = report.summary.discrepancies;
    await addActivity({
      label: discrepancies > 0 ? "Discrepancy flagged" : "Comparison complete",
      sub: discrepancies > 0
          ? `${discrepancies} discrepanc${discrepancies > 1 ? "ies" : "y"} found · ${report.carrier_a} ${report.contract_a_year} vs ${report.contract_b_year}`
          : `No discrepancies · ${report.carrier_a} ${report.contract_a_year} vs ${report.contract_b_year}`,
      time: "just now",
      type: discrepancies > 0 ? "alert" : "compare",
    });
  }, []);

  const addAuditScan = useCallback(async (scan: AuditScan) => {
    setState((prev) => ({
      ...prev,
      auditScans: [scan, ...prev.auditScans],
    }));

    const { error } = await supabase.from("audit_scans").insert(scan);
    if (error) console.warn("[Supabase] audit_scans insert failed:", error.message);
    
    const flagCount = scan.results.length;
    await addActivity({
      label: "M&A scan complete",
      sub: `${scan.document_name} — ${flagCount} red flag${flagCount !== 1 ? "s" : ""} found`,
      time: "just now",
      type: "audit",
    });
  }, []);

  return (
    <NexusContext.Provider value={{ state, addContract, addDeltaReport, addAuditScan }}>
      {children}
    </NexusContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNexus(): NexusContextValue {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error("useNexus must be used within a NexusProvider");
  return ctx;
}
