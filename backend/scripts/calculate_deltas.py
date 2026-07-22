"""
Nexus OS — Premium Delta Calculation Engine
Skill: insurance-comparison-engine (skill.yaml)

Implements:
  - Pandas-based comparison of two extracted contract JSONs
  - CPI-based inflation adjustment (2018–2026 annual rates)
  - Flags any premium increase > 15% (inflation-adjusted) as DISCREPANCY
  - Returns structured delta report JSON
"""

import pandas as pd
import numpy as np
import json
from typing import Any

# ── CPI Annual Rates (South Africa / Global blended — update with live source) ─
# Source: World Bank / Stats SA historical CPI
CPI_RATES: dict[int, float] = {
    2018: 4.62,
    2019: 4.13,
    2020: 3.22,
    2021: 4.51,
    2022: 6.90,
    2023: 5.90,
    2024: 4.40,
    2025: 3.80,
    2026: 3.20,  # Projected
}

# Fields to compare numerically
NUMERIC_FIELDS = [
    "premium_amount",
    "benefit_limit",
    "sum_assured",
]

# Fields to compare categorically
CATEGORICAL_FIELDS = [
    "policy_type",
    "premium_frequency",
    "critical_illness_rider",
    "waiver_of_premium",
]

# Discrepancy threshold: inflation-adjusted % increase
DISCREPANCY_THRESHOLD = 15.0
WATCH_THRESHOLD = 0.0  # Any increase triggers a watch; >15% = discrepancy


def compute_cumulative_inflation(year_a: int, year_b: int) -> float:
    """
    Compute the cumulative CPI inflation rate between two years.
    Returns a multiplier e.g. 1.147 means 14.7% cumulative inflation.
    """
    if year_a >= year_b:
        return 0.0
    cumulative = 1.0
    for year in range(year_a, year_b):
        rate = CPI_RATES.get(year, 4.5) / 100.0
        cumulative *= 1 + rate
    return (cumulative - 1) * 100  # Return as percentage


def classify_discrepancy(
    change_pct: float | None,
    inflation_adjusted_pct: float | None,
) -> str:
    """
    Per skill.yaml: flag any increase > 15% (inflation-adjusted) as DISCREPANCY.
    """
    if inflation_adjusted_pct is None and change_pct is None:
        return "OK"
    pct = inflation_adjusted_pct if inflation_adjusted_pct is not None else change_pct
    if pct is None:
        return "OK"
    if pct > DISCREPANCY_THRESHOLD:
        return "DISCREPANCY"
    if pct > WATCH_THRESHOLD:
        return "WATCH"
    return "OK"


def compare_numeric_field(
    field: str,
    val_a: Any,
    val_b: Any,
    cumulative_inflation_pct: float,
) -> dict:
    """Compare a single numeric field, returning delta details."""
    try:
        a = float(val_a) if val_a is not None else None
        b = float(val_b) if val_b is not None else None
    except (TypeError, ValueError):
        a, b = None, None

    change_pct: float | None = None
    inflation_adj_pct: float | None = None

    if a is not None and b is not None and a != 0:
        change_pct = ((b - a) / a) * 100
        # Inflation-adjusted: remove expected CPI growth from nominal change
        inflation_adj_pct = change_pct - cumulative_inflation_pct

    discrepancy = classify_discrepancy(change_pct, inflation_adj_pct)

    note = ""
    if discrepancy == "DISCREPANCY":
        note = f"Exceeds {DISCREPANCY_THRESHOLD}% inflation-adjusted threshold."
    elif discrepancy == "WATCH":
        note = "Increase within expected range but worth monitoring."
    elif change_pct is not None and change_pct < 0:
        note = f"Benefit reduced by {abs(change_pct):.1f}%."

    return {
        "field_name": field.replace("_", " ").title(),
        "contract_a_value": val_a,
        "contract_b_value": val_b,
        "change_pct": round(change_pct, 2) if change_pct is not None else None,
        "inflation_adjusted_change_pct": round(inflation_adj_pct, 2) if inflation_adj_pct is not None else None,
        "discrepancy_level": discrepancy,
        "note": note,
    }


def compare_categorical_field(field: str, val_a: Any, val_b: Any) -> dict:
    """Compare a categorical / boolean field."""
    changed = str(val_a) != str(val_b)
    discrepancy = "WATCH" if changed else "OK"
    note = f"Changed from '{val_a}' to '{val_b}'." if changed else "Consistent."

    return {
        "field_name": field.replace("_", " ").title(),
        "contract_a_value": val_a,
        "contract_b_value": val_b,
        "change_pct": None,
        "inflation_adjusted_change_pct": None,
        "discrepancy_level": discrepancy,
        "note": note,
    }


def _safe_int(val: Any, default: int) -> int:
    if val is None:
        return default
    try:
        return int(val)
    except (ValueError, TypeError):
        import re
        match = re.search(r"\b(19|20)\d{2}\b", str(val))
        if match:
            return int(match.group(0))
        return default


def calculate_deltas(contract_a: dict, contract_b: dict) -> dict:
    """
    Main delta function.
    Compares two extracted contract dicts and returns a full delta report.

    Args:
        contract_a: Extracted JSON from extract_data.py (older contract)
        contract_b: Extracted JSON from extract_data.py (newer contract)

    Returns:
        dict: Full delta report matching DeltaReport TypeScript interface
    """
    year_a = _safe_int(contract_a.get("policy_year"), 2018)
    year_b = _safe_int(contract_b.get("policy_year"), 2024)

    cumulative_inflation = compute_cumulative_inflation(year_a, year_b)

    # Build comparison using Pandas for auditability
    records = []

    # Numeric comparisons
    for field in NUMERIC_FIELDS:
        val_a = contract_a.get(field)
        val_b = contract_b.get(field)
        record = compare_numeric_field(field, val_a, val_b, cumulative_inflation)
        records.append(record)

    # Categorical comparisons
    for field in CATEGORICAL_FIELDS:
        val_a = contract_a.get(field)
        val_b = contract_b.get(field)
        record = compare_categorical_field(field, val_a, val_b)
        records.append(record)

    # Exclusion count comparison
    exc_a = len(contract_a.get("exclusions") or [])
    exc_b = len(contract_b.get("exclusions") or [])
    records.append(compare_numeric_field("exclusion_count", exc_a, exc_b, 0))

    # Build summary using Pandas DataFrame
    df = pd.DataFrame(records)
    total = len(df)
    discrepancies = int((df["discrepancy_level"] == "DISCREPANCY").sum())
    watches = int((df["discrepancy_level"] == "WATCH").sum())
    ok_count = int((df["discrepancy_level"] == "OK").sum())

    # Premium-specific summary
    premium_row = df[df["field_name"] == "Premium Amount"]
    premium_nominal_pct = (
        float(premium_row["change_pct"].iloc[0])
        if not premium_row.empty and premium_row["change_pct"].iloc[0] is not None
        else 0.0
    )
    premium_adj_pct = (
        float(premium_row["inflation_adjusted_change_pct"].iloc[0])
        if not premium_row.empty and premium_row["inflation_adjusted_change_pct"].iloc[0] is not None
        else 0.0
    )

    report = {
        "contract_a_year": year_a,
        "contract_b_year": year_b,
        "carrier_a": contract_a.get("carrier", "Unknown"),
        "carrier_b": contract_b.get("carrier", "Unknown"),
        "cumulative_inflation_pct": round(cumulative_inflation, 2),
        "summary": {
            "total_fields": total,
            "discrepancies": discrepancies,
            "watches": watches,
            "ok_fields": ok_count,
            "premium_total_change_pct": round(premium_nominal_pct, 2),
            "inflation_adjusted_change_pct": round(premium_adj_pct, 2),
        },
        "fields": records,
    }

    return report


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("Usage: python calculate_deltas.py <contract_a.json> <contract_b.json>")
        sys.exit(1)

    with open(sys.argv[1]) as f:
        a = json.load(f)
    with open(sys.argv[2]) as f:
        b = json.load(f)

    result = calculate_deltas(a, b)
    print(json.dumps(result, indent=2))
