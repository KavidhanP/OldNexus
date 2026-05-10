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
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Configure Gemini ──────────────────────────────────────────────────────────
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

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


def extract_contract(pdf_path: str) -> dict:
    """
    Full extraction pipeline:
    1. Extract raw text from PDF
    2. Send to Gemini 1.5 Pro with structured prompt
    3. Parse and return JSON result

    Args:
        pdf_path: Absolute or relative path to the PDF file

    Returns:
        dict: Extracted contract fields matching EXTRACTION_SCHEMA
    """
    # Step 1: Get raw text
    raw_text = extract_raw_text(pdf_path)
    if not raw_text.strip():
        raise ValueError(f"No extractable text found in PDF: {pdf_path}")

    # Step 2: Build prompt and call Gemini
    prompt = build_prompt(raw_text)

    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config={
            "temperature": 0.1,  # Low temp for deterministic extraction
            "response_mime_type": "application/json",
        },
        # Enterprise privacy: no training data opt-in
        # system_instruction is not yet supported in Python SDK v0.7; embedded in prompt
    )

    response = model.generate_content(prompt)
    raw_json = response.text.strip()

    # Step 3: Parse
    try:
        result = json.loads(raw_json)
    except json.JSONDecodeError as e:
        # Attempt to strip any accidental code fences
        cleaned = raw_json.strip("`").lstrip("json\n").strip()
        result = json.loads(cleaned)

    # Attach source metadata
    result["_source_file"] = str(pdf_path)
    result["_extraction_model"] = "gemini-1.5-pro"

    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python extract_data.py <path/to/contract.pdf>")
        sys.exit(1)

    output = extract_contract(sys.argv[1])
    print(json.dumps(output, indent=2))
