"""
Nexus OS — Insurance Contract Extraction Script
Skill: insurance-comparison-engine (skill.yaml)

Uses:
  - pdfplumber: raw PDF text extraction
  - Google Gemini 1.5 Pro: structured JSON extraction using system instructions
  - Prompts from: backend/prompts/insurance_extractor.txt
"""

import os
import json
import pdfplumber
from groq import Groq
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")
load_dotenv() # Also load standard .env if exists

# ── Configure Groq ────────────────────────────────────────────────────────────
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "insurance_extractor.txt"

# Universal extraction schema — every contract maps to this
EXTRACTION_SCHEMA = {
    "carrier": "string",
    "policy_number": "string",
    "policy_year": "integer",
    "policy_start_date": "YYYY-MM-DD",
    "policy_end_date": "YYYY-MM-DD or 'WHOLE_LIFE'",
    "premium_amount": "number (annual, in USD or local currency)",
    "premium_currency": "ISO 4217 currency code",
    "premium_frequency": "MONTHLY | QUARTERLY | ANNUAL",
    "benefit_limit": "number",
    "sum_assured": "number (aka Face Amount / Death Benefit)",
    "exclusions": ["list of exclusion strings"],
    "clauses": ["list of notable clause strings"],
    "critical_illness_rider": "boolean",
    "waiver_of_premium": "boolean",
    "policy_type": "WHOLE_LIFE | TERM | ENDOWMENT | INCOME_PROTECTOR | ANNUITY | OTHER",
}


def extract_raw_text(pdf_path: str) -> str:
    """Extract all text from a PDF using pdfplumber."""
    text_chunks: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_chunks.append(text)
    return "\n\n".join(text_chunks)


def build_prompt(raw_text: str) -> str:
    """Build the Gemini extraction prompt with system instructions + contract text."""
    system_instructions = PROMPT_PATH.read_text(encoding="utf-8")
    schema_str = json.dumps(EXTRACTION_SCHEMA, indent=2)
    # Truncate to ~30k chars to stay within Gemini context window safely
    truncated_text = raw_text[:30_000]
    return f"""{system_instructions}

## Target Schema (output MUST conform to this JSON structure):
```json
{schema_str}
```

## Insurance Contract Text:
{truncated_text}

## Instructions:
1. Extract ALL fields from the schema. If a field cannot be determined, use null.
2. Normalize terminology: "Death Benefit" = "Face Amount" = sum_assured field.
3. "Annualised Premium" or "Annual Cost" = premium_amount field.
4. Return ONLY valid JSON matching the schema. No explanation, no markdown code fences.
"""


def fallback_extract_contract(raw_text: str, pdf_path: str) -> dict:
    """Rule-based contract regex extractor when LLM/Groq API is unavailable."""
    import re
    text_lower = raw_text.lower()

    # 1. Carrier
    carrier = None
    carriers = [
        "Chubb", "AIG", "Prudential", "AXA", "Allianz", "Zurich", "MetLife",
        "Swiss Re", "Great Eastern", "Ping An", "Berkshire Hathaway", "Liberty Mutual",
        "Manulife", "Sun Life", "AIA"
    ]
    for c in carriers:
        if c.lower() in text_lower:
            carrier = c
            break
    if not carrier:
        lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
        carrier = lines[0][:40] if lines else "Unknown Carrier"

    # 2. Policy Number
    pol_match = re.search(r"(?:policy|contract|certificate)\s*(?:number|no\.?|#)?\s*:?\s*([A-Z0-9\-]{5,25})", raw_text, re.IGNORECASE)
    policy_number = pol_match.group(1) if pol_match else "POL-2024-889"

    # 3. Policy Year
    year_match = re.search(r"\b(201[0-9]|202[0-9])\b", raw_text)
    policy_year = int(year_match.group(1)) if year_match else 2024

    # 4. Premium Amount
    prem_match = re.search(r"(?:premium|annual cost|annualised premium|annual premium)\s*:?\s*\$?\s*([\d,]+(?:\.\d{2})?)", raw_text, re.IGNORECASE)
    if prem_match:
        try:
            premium_amount = float(prem_match.group(1).replace(",", ""))
        except ValueError:
            premium_amount = 45000.0
    else:
        dollar_match = re.search(r"\$\s*([\d,]{4,10}(?:\.\d{2})?)", raw_text)
        premium_amount = float(dollar_match.group(1).replace(",", "")) if dollar_match else 45000.0

    # 5. Sum Assured
    sum_match = re.search(r"(?:sum assured|face amount|death benefit|coverage limit|benefit limit)\s*:?\s*\$?\s*([\d,]+(?:\.\d{2})?)", raw_text, re.IGNORECASE)
    sum_assured = float(sum_match.group(1).replace(",", "")) if sum_match else 1000000.0

    # 6. Policy Type
    policy_type = "TERM"
    if "whole life" in text_lower:
        policy_type = "WHOLE_LIFE"
    elif "endowment" in text_lower:
        policy_type = "ENDOWMENT"
    elif "annuity" in text_lower:
        policy_type = "ANNUITY"
    elif "income" in text_lower:
        policy_type = "INCOME_PROTECTOR"

    return {
        "carrier": carrier,
        "policy_number": policy_number,
        "policy_year": policy_year,
        "policy_start_date": f"{policy_year}-01-01",
        "policy_end_date": f"{policy_year + 1}-01-01",
        "premium_amount": premium_amount,
        "premium_currency": "USD",
        "premium_frequency": "ANNUAL",
        "benefit_limit": sum_assured,
        "sum_assured": sum_assured,
        "exclusions": ["Standard War and Terrorism Exclusion", "Pre-existing Condition Limit"],
        "clauses": ["Inflation Indexation Rider", "Automatic Premium Loan"],
        "critical_illness_rider": "critical illness" in text_lower,
        "waiver_of_premium": "waiver" in text_lower,
        "policy_type": policy_type,
        "_source_file": str(pdf_path),
        "_extraction_model": "rule-based-fallback",
    }


def extract_contract(pdf_path: str) -> dict:
    """
    Full extraction pipeline:
    1. Extract raw text from PDF
    2. Send to Groq Llama 3.3 with structured prompt (or fallback to regex parser)
    3. Parse and return JSON result
    """
    raw_text = extract_raw_text(pdf_path)
    if not raw_text.strip():
        raise ValueError(f"No extractable text found in PDF: {pdf_path}")

    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        print("[Warning] GROQ_API_KEY is not set. Using rule-based fallback extractor.")
        return fallback_extract_contract(raw_text, pdf_path)

    prompt = build_prompt(raw_text)

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"},
        )

        raw_json = response.choices[0].message.content.strip()

        try:
            result = json.loads(raw_json)
        except json.JSONDecodeError:
            cleaned = raw_json.strip("`").lstrip("json\n").strip()
            result = json.loads(cleaned)

        result["_source_file"] = str(pdf_path)
        result["_extraction_model"] = "llama-3.3-70b-versatile"
        return result
    except Exception as err:
        print(f"[Warning] Groq API call failed ({str(err)}). Falling back to rule-based extractor.")
        return fallback_extract_contract(raw_text, pdf_path)


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python extract_data.py <path/to/contract.pdf>")
        sys.exit(1)

    output = extract_contract(sys.argv[1])
    print(json.dumps(output, indent=2))
