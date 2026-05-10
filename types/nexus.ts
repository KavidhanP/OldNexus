// ─── Nexus OS — Shared TypeScript Types ──────────────────────────────────────
// All financial calculations are kept as numbers; display formatting
// is handled by Intl.NumberFormat in the UI layer.

// ── Client / CRM ─────────────────────────────────────────────────────────────
export type AssetClass = "GOLD" | "EQUITY" | "PE" | "CASH" | "OTHER";

export interface ClientAllocation {
  id: string;
  asset_class: AssetClass;
  percentage: number;
  value_usd: number;
  as_of_date: string; // ISO date
}

export interface Client {
  id: string;
  name: string;
  net_worth_usd: number;
  relationship_manager: string;
  risk_profile: "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE";
  allocations: ClientAllocation[];
  contract_count: number;
  created_at: string;
}

// ── Insurance Contracts ───────────────────────────────────────────────────────
export type ContractStatus = "PENDING" | "EXTRACTING" | "EXTRACTED" | "COMPARED" | "ERROR";

export interface ExtractedContract {
  id: string;
  client_id: string | null;
  carrier: string;
  policy_number: string;
  policy_year: number;
  policy_start_date: string;
  policy_end_date: string;
  premium_amount: number;
  premium_frequency: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  benefit_limit: number;
  sum_assured: number;
  exclusions: string[];
  clauses: string[];
  raw_text_excerpt: string;
  file_path: string;
  status: ContractStatus;
  created_at: string;
}

// ── Delta / Comparison ────────────────────────────────────────────────────────
export type DiscrepancyLevel = "OK" | "WATCH" | "DISCREPANCY";

export interface DeltaField {
  field_name: string;
  contract_a_value: string | number;
  contract_b_value: string | number;
  change_pct: number | null;
  inflation_adjusted_change_pct: number | null;
  discrepancy_level: DiscrepancyLevel;
  note: string;
}

export interface DeltaReport {
  id: string;
  contract_a_id: string;
  contract_b_id: string;
  contract_a_year: number;
  contract_b_year: number;
  carrier_a: string;
  carrier_b: string;
  summary: {
    total_fields: number;
    discrepancies: number;
    watches: number;
    ok_fields: number;
    premium_total_change_pct: number;
    inflation_adjusted_change_pct: number;
  };
  fields: DeltaField[];
  generated_at: string;
}

// ── M&A Audit ─────────────────────────────────────────────────────────────────
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AuditResult {
  id: string;
  document_name: string;
  clause_type: string;
  risk_level: RiskLevel;
  excerpt: string;
  page_number: number;
  recommendation: string;
  scanned_at: string;
}

export interface AuditScan {
  id: string;
  document_name: string;
  total_pages: number;
  status: "PENDING" | "SCANNING" | "COMPLETE" | "ERROR";
  results: AuditResult[];
  scanned_at: string;
}

// ── Dashboard KPIs ────────────────────────────────────────────────────────────
export interface KpiData {
  label: string;
  value: string;
  change: number; // percentage change vs prior period
  trend: "UP" | "DOWN" | "FLAT";
  icon: string;
}

// ── Market Data ───────────────────────────────────────────────────────────────
export interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
  currency: string;
}

export interface MarketDataPoint {
  date: string;
  us30: number;
  gold: number;
  portfolio: number;
}

// ── M&A Pipeline ─────────────────────────────────────────────────────────────
export type MAStage =
  | "SCREENING"
  | "INITIAL_DILIGENCE"
  | "ADVANCED_DILIGENCE"
  | "NEGOTIATION"
  | "CLOSING"
  | "COMPLETED"
  | "REJECTED";

export interface MATarget {
  id: string;
  company_name: string;
  sector: string;
  stage: MAStage;
  risk_score: number; // 0-100
  enterprise_value_usd: number | null;
  red_flags: number;
  added_at: string;
}

// ── API Response wrapper ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: "success" | "error";
}
