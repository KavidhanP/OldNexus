import type {
  Client,
  MATarget,
  MarketDataPoint,
  MarketTicker,
  KpiData,
  DeltaReport,
  AuditScan,
} from "@/types/nexus";

// ── Market Tickers (mock — swap for live API) ─────────────────────────────────
export const mockTickers: MarketTicker[] = [
  { symbol: "US30", name: "Dow Jones", price: 39_842.48, change: 124.52, change_pct: 0.31, currency: "USD" },
  { symbol: "XAUUSD", name: "Gold Spot", price: 2_378.90, change: -8.40, change_pct: -0.35, currency: "USD" },
  { symbol: "SPX", name: "S&P 500", price: 5_283.40, change: 22.10, change_pct: 0.42, currency: "USD" },
  { symbol: "NQ100", name: "Nasdaq 100", price: 18_623.80, change: 95.20, change_pct: 0.51, currency: "USD" },
  { symbol: "GBPUSD", name: "GBP/USD", price: 1.2746, change: 0.0032, change_pct: 0.25, currency: "USD" },
  { symbol: "CRUDE", name: "Brent Crude", price: 82.34, change: -0.62, change_pct: -0.75, currency: "USD" },
];

// ── 12-Month Asset Chart Data ─────────────────────────────────────────────────
export const mockMarketData: MarketDataPoint[] = [
  { date: "May '25", us30: 37200, gold: 2180, portfolio: 4100000 },
  { date: "Jun '25", us30: 37800, gold: 2240, portfolio: 4230000 },
  { date: "Jul '25", us30: 38100, gold: 2310, portfolio: 4380000 },
  { date: "Aug '25", us30: 37600, gold: 2290, portfolio: 4290000 },
  { date: "Sep '25", us30: 38400, gold: 2350, portfolio: 4510000 },
  { date: "Oct '25", us30: 38900, gold: 2380, portfolio: 4620000 },
  { date: "Nov '25", us30: 39100, gold: 2360, portfolio: 4700000 },
  { date: "Dec '25", us30: 38700, gold: 2420, portfolio: 4650000 },
  { date: "Jan '26", us30: 39200, gold: 2390, portfolio: 4780000 },
  { date: "Feb '26", us30: 39500, gold: 2410, portfolio: 4840000 },
  { date: "Mar '26", us30: 39100, gold: 2350, portfolio: 4790000 },
  { date: "Apr '26", us30: 39842, gold: 2378, portfolio: 4920000 },
];

// ── KPI Cards ─────────────────────────────────────────────────────────────────
export const mockKpis: KpiData[] = [
  { label: "Contracts Audited", value: "247", change: 12.4, trend: "UP", icon: "FileText" },
  { label: "Discrepancies Flagged", value: "38", change: -8.2, trend: "DOWN", icon: "AlertTriangle" },
  { label: "M&A Targets", value: "14", change: 27.3, trend: "UP", icon: "TrendingUp" },
  { label: "HNWI Clients", value: "62", change: 4.8, trend: "UP", icon: "Users" },
];

// ── M&A Pipeline ──────────────────────────────────────────────────────────────
export const mockMATargets: MATarget[] = [
  { id: "1", company_name: "Meridian Life Assurance", sector: "Insurance", stage: "ADVANCED_DILIGENCE", risk_score: 68, enterprise_value_usd: 420_000_000, red_flags: 4, added_at: "2026-03-12" },
  { id: "2", company_name: "Apex Capital Partners", sector: "Private Equity", stage: "INITIAL_DILIGENCE", risk_score: 42, enterprise_value_usd: 890_000_000, red_flags: 1, added_at: "2026-04-01" },
  { id: "3", company_name: "Sovereign Re Holdings", sector: "Reinsurance", stage: "NEGOTIATION", risk_score: 81, enterprise_value_usd: 1_200_000_000, red_flags: 7, added_at: "2026-02-18" },
  { id: "4", company_name: "GreenBridge Wealth", sector: "Wealth Management", stage: "SCREENING", risk_score: 29, enterprise_value_usd: null, red_flags: 0, added_at: "2026-05-02" },
  { id: "5", company_name: "Vantage Risk Solutions", sector: "MGA", stage: "INITIAL_DILIGENCE", risk_score: 55, enterprise_value_usd: 310_000_000, red_flags: 2, added_at: "2026-04-20" },
];

// ── CRM Clients ───────────────────────────────────────────────────────────────
export const mockClients: Client[] = [
  {
    id: "c1", name: "Mohammed Al-Rashid", net_worth_usd: 18_500_000,
    relationship_manager: "James Osei", risk_profile: "BALANCED",
    contract_count: 4, created_at: "2024-01-15",
    allocations: [
      { id: "a1", asset_class: "GOLD", percentage: 35, value_usd: 6_475_000, as_of_date: "2026-04-30" },
      { id: "a2", asset_class: "EQUITY", percentage: 40, value_usd: 7_400_000, as_of_date: "2026-04-30" },
      { id: "a3", asset_class: "PE", percentage: 20, value_usd: 3_700_000, as_of_date: "2026-04-30" },
      { id: "a4", asset_class: "CASH", percentage: 5, value_usd: 925_000, as_of_date: "2026-04-30" },
    ],
  },
  {
    id: "c2", name: "Adaeze Okonkwo", net_worth_usd: 9_200_000,
    relationship_manager: "Sarah Mensah", risk_profile: "AGGRESSIVE",
    contract_count: 2, created_at: "2024-06-20",
    allocations: [
      { id: "a5", asset_class: "EQUITY", percentage: 60, value_usd: 5_520_000, as_of_date: "2026-04-30" },
      { id: "a6", asset_class: "PE", percentage: 30, value_usd: 2_760_000, as_of_date: "2026-04-30" },
      { id: "a7", asset_class: "GOLD", percentage: 10, value_usd: 920_000, as_of_date: "2026-04-30" },
    ],
  },
  {
    id: "c3", name: "Kwame Asante-Boateng", net_worth_usd: 32_000_000,
    relationship_manager: "James Osei", risk_profile: "CONSERVATIVE",
    contract_count: 7, created_at: "2023-09-01",
    allocations: [
      { id: "a8", asset_class: "GOLD", percentage: 45, value_usd: 14_400_000, as_of_date: "2026-04-30" },
      { id: "a9", asset_class: "CASH", percentage: 20, value_usd: 6_400_000, as_of_date: "2026-04-30" },
      { id: "a10", asset_class: "EQUITY", percentage: 25, value_usd: 8_000_000, as_of_date: "2026-04-30" },
      { id: "a11", asset_class: "PE", percentage: 10, value_usd: 3_200_000, as_of_date: "2026-04-30" },
    ],
  },
  {
    id: "c4", name: "Fatima Al-Mansouri", net_worth_usd: 55_000_000,
    relationship_manager: "Sarah Mensah", risk_profile: "BALANCED",
    contract_count: 11, created_at: "2023-03-12",
    allocations: [
      { id: "a12", asset_class: "GOLD", percentage: 30, value_usd: 16_500_000, as_of_date: "2026-04-30" },
      { id: "a13", asset_class: "PE", percentage: 35, value_usd: 19_250_000, as_of_date: "2026-04-30" },
      { id: "a14", asset_class: "EQUITY", percentage: 30, value_usd: 16_500_000, as_of_date: "2026-04-30" },
      { id: "a15", asset_class: "CASH", percentage: 5, value_usd: 2_750_000, as_of_date: "2026-04-30" },
    ],
  },
];

// ── Sample Delta Report ────────────────────────────────────────────────────────
export const mockDeltaReport: DeltaReport = {
  id: "dr-001",
  contract_a_id: "ctr-2018-001",
  contract_b_id: "ctr-2024-001",
  contract_a_year: 2018,
  contract_b_year: 2024,
  carrier_a: "Prudential Life",
  carrier_b: "Prudential Life",
  summary: {
    total_fields: 8,
    discrepancies: 2,
    watches: 2,
    ok_fields: 4,
    premium_total_change_pct: 34.2,
    inflation_adjusted_change_pct: 18.7,
  },
  fields: [
    { field_name: "Annual Premium", contract_a_value: 48000, contract_b_value: 64416, change_pct: 34.2, inflation_adjusted_change_pct: 18.7, discrepancy_level: "DISCREPANCY", note: "Exceeds 15% inflation-adjusted threshold." },
    { field_name: "Death Benefit / Face Amount", contract_a_value: 2500000, contract_b_value: 2500000, change_pct: 0, inflation_adjusted_change_pct: -15.8, discrepancy_level: "WATCH", note: "Nominal value unchanged, real value eroded by inflation." },
    { field_name: "Benefit Limit", contract_a_value: 500000, contract_b_value: 420000, change_pct: -16, inflation_adjusted_change_pct: -27.5, discrepancy_level: "DISCREPANCY", note: "Benefit reduced. Investigate change in coverage terms." },
    { field_name: "Critical Illness Rider", contract_a_value: "Included", contract_b_value: "Excluded", change_pct: null, inflation_adjusted_change_pct: null, discrepancy_level: "WATCH", note: "Rider removed in 2024 contract. Confirm with client." },
    { field_name: "Policy Term", contract_a_value: "Whole Life", contract_b_value: "Whole Life", change_pct: 0, inflation_adjusted_change_pct: 0, discrepancy_level: "OK", note: "Consistent." },
    { field_name: "Premium Frequency", contract_a_value: "ANNUAL", contract_b_value: "ANNUAL", change_pct: 0, inflation_adjusted_change_pct: 0, discrepancy_level: "OK", note: "Consistent." },
    { field_name: "Carrier Rating", contract_a_value: "AA-", contract_b_value: "A+", change_pct: null, inflation_adjusted_change_pct: null, discrepancy_level: "OK", note: "One-notch downgrade, still investment grade." },
    { field_name: "Exclusion Count", contract_a_value: 3, contract_b_value: 3, change_pct: 0, inflation_adjusted_change_pct: 0, discrepancy_level: "OK", note: "Same exclusion set." },
  ],
  generated_at: "2026-05-10T02:30:00Z",
};

// ── M&A Audit Scan ────────────────────────────────────────────────────────────
export const mockAuditScan: AuditScan = {
  id: "scan-001",
  document_name: "Meridian_Life_Share_Purchase_Agreement_v3.pdf",
  total_pages: 142,
  status: "COMPLETE",
  scanned_at: "2026-05-10T01:15:00Z",
  results: [
    { id: "r1", document_name: "Meridian_Life_SPA_v3.pdf", clause_type: "Change of Control", risk_level: "CRITICAL", excerpt: "...any transfer of shares exceeding 30% shall constitute a Change of Control triggering automatic termination of all in-force policies...", page_number: 47, recommendation: "Negotiate a 12-month run-off clause before triggering termination provisions.", scanned_at: "2026-05-10T01:15:00Z" },
    { id: "r2", document_name: "Meridian_Life_SPA_v3.pdf", clause_type: "Anti-Assignment", risk_level: "HIGH", excerpt: "...the Company shall not assign, transfer, or novate any rights or obligations without prior written consent of all policyholders...", page_number: 89, recommendation: "Obtain blanket policyholder consent prior to close or restructure the transaction as an asset deal.", scanned_at: "2026-05-10T01:15:00Z" },
    { id: "r3", document_name: "Meridian_Life_SPA_v3.pdf", clause_type: "Material Adverse Change", risk_level: "HIGH", excerpt: "...a material adverse change shall include any regulatory action, loss of key personnel, or aggregate claim ratio exceeding 85%...", page_number: 23, recommendation: "The 85% claim ratio threshold is below market standard (95%). Renegotiate MAC definition.", scanned_at: "2026-05-10T01:15:00Z" },
    { id: "r4", document_name: "Meridian_Life_SPA_v3.pdf", clause_type: "Indemnification Cap", risk_level: "MEDIUM", excerpt: "...Seller's aggregate liability shall not exceed 15% of the Purchase Price...", page_number: 112, recommendation: "Standard market cap is 20-30% for insurance entities. Renegotiate upward.", scanned_at: "2026-05-10T01:15:00Z" },
    { id: "r5", document_name: "Meridian_Life_SPA_v3.pdf", clause_type: "Non-Compete", risk_level: "MEDIUM", excerpt: "...Sellers shall not engage in any life insurance business within the Republic of South Africa for a period of 5 years from Closing Date...", page_number: 128, recommendation: "5-year non-compete may be unenforceable under RSA Competition Act. Reduce to 3 years.", scanned_at: "2026-05-10T01:15:00Z" },
    { id: "r6", document_name: "Meridian_Life_SPA_v3.pdf", clause_type: "Regulatory Approval", risk_level: "LOW", excerpt: "...completion of the transaction is subject to FSCA approval within 90 days of signature...", page_number: 8, recommendation: "90-day regulatory timeline is standard. Monitor FSCA pipeline for delays.", scanned_at: "2026-05-10T01:15:00Z" },
  ],
};
