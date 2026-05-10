import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format USD currency */
export function formatUSD(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a percentage with sign */
export function formatPct(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/** Format large numbers compactly */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Risk level to colour mapping */
export function riskColor(
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
): string {
  const map = {
    LOW: "text-emerald-600 bg-emerald-50 border-emerald-200",
    MEDIUM: "text-amber-600 bg-amber-50 border-amber-200",
    HIGH: "text-orange-600 bg-orange-50 border-orange-200",
    CRITICAL: "text-red-700 bg-red-50 border-red-200",
  };
  return map[level];
}

/** Stage display label */
export function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    SCREENING: "Screening",
    INITIAL_DILIGENCE: "Initial Diligence",
    ADVANCED_DILIGENCE: "Advanced Diligence",
    NEGOTIATION: "Negotiation",
    CLOSING: "Closing",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
  };
  return map[stage] ?? stage;
}

/** Discrepancy level colour */
export function discrepancyColor(
  level: "OK" | "WATCH" | "DISCREPANCY"
): string {
  const map = {
    OK: "text-emerald-600",
    WATCH: "text-amber-600",
    DISCREPANCY: "text-red-600",
  };
  return map[level];
}
