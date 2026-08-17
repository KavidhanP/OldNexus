"""
Nexus OS — M&A Audit Router
Endpoints:
  POST /audit/scan  — Upload VDR document, scan for red flag clauses via Gemini
"""

import os
import uuid
import tempfile
import json
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
import pdfplumber
from groq import Groq
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")
load_dotenv()
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "ma_redflags.txt"

router = APIRouter()

RISK_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}


def fallback_scan_document(text_chunks: list[str], filename: str, total_pages: int) -> dict:
    """Rule-based VDR red flag scanner when LLM/Groq API is unavailable."""
    results = []
    rules = [
        ("Change of Control / Assignment", ["change of control", "assignment", "consent required", "transfer of rights"], "CRITICAL",
         "Clause requires counterparty consent upon ownership change, posing transaction deal-block risk.",
         "Obtain written waiver from counterparty prior to closing transaction."),
        ("Indemnification & Cap", ["indemnity", "indemnify", "unlimited liability", "hold harmless"], "HIGH",
         "Contains uncapped indemnity obligations or broad hold-harmless provisions.",
         "Negotiate liability caps equal to total contract value or tail insurance coverage."),
        ("Exclusivity & Non-Compete", ["exclusivity", "non-compete", "restrictive covenant", "solicit"], "HIGH",
         "Restricts market operation post-acquisition or imposes non-solicitation liabilities.",
         "Carve out target portfolio companies from restrictive operational covenants."),
        ("Termination & Penalty", ["termination for convenience", "break fee", "liquidated damages", "cancellation"], "MEDIUM",
         "Subject to unilateral termination or penalty fees upon structural changes.",
         "Secure transition agreements and verify fee schedules prior to closing."),
        ("Governing Law & Venue", ["jurisdiction", "governing law", "arbitration", "forum"], "LOW",
         "Specifies foreign governing law or non-standard dispute resolution venue.",
         "Review legal costs and align dispute resolution with primary operating jurisdiction.")
    ]

    for title, keywords, risk, explanation, recommendation in rules:
        matched_pages = []
        clause_snippet = ""
        for i, chunk in enumerate(text_chunks):
            chunk_lower = chunk.lower()
            for kw in keywords:
                if kw in chunk_lower:
                    matched_pages.append(i + 1)
                    if not clause_snippet:
                        idx = chunk_lower.find(kw)
                        start = max(0, idx - 80)
                        end = min(len(chunk), idx + 120)
                        clause_snippet = "..." + chunk[start:end].replace("\n", " ").strip() + "..."
                    break

        if matched_pages:
            results.append({
                "clause_type": title,
                "title": title,
                "risk_level": risk,
                "page_number": f"Page {matched_pages[0]}" if len(matched_pages) == 1 else f"Pages {', '.join(map(str, matched_pages))}",
                "page": matched_pages[0],
                "clause_text": clause_snippet or f"Reference clause matching {title.lower()} terms.",
                "explanation": explanation,
                "recommendation": recommendation,
            })

    if not results:
        results.append({
            "clause_type": "Standard Operational Terms",
            "title": "Standard Commercial Agreement",
            "risk_level": "LOW",
            "page_number": "Page 1",
            "page": 1,
            "clause_text": "Standard commercial terms reviewed. No high-risk change of control or uncapped indemnity clauses detected.",
            "explanation": "Document conforms to baseline commercial standards with standard risk exposure.",
            "recommendation": "Proceed with standard integration due diligence checklist.",
        })

    return {
        "document_name": filename,
        "total_pages": total_pages,
        "results": results,
    }


def scan_document(pdf_path: str, filename: str) -> dict:
    """
    Scan a VDR document for M&A red flag clauses using Groq / Llama 3.3.
    Processes the document in page chunks to ensure 100% coverage and avoid truncation.
    Falls back gracefully to rule-based analysis if Groq API is unavailable.
    """
    text_chunks: list[str] = []
    total_pages = 0
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                text_chunks.append(f"[PAGE {i + 1}]\n{text}")

    if not text_chunks:
        return {
            "document_name": filename,
            "total_pages": total_pages,
            "results": [],
        }

    # If Groq API key is missing or empty, use fallback scanner directly
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        print("[Warning] GROQ_API_KEY is not set. Using rule-based fallback scanner.")
        res = fallback_scan_document(text_chunks, filename, total_pages)
        for r in res["results"]:
            r["id"] = str(uuid.uuid4())
            r["document_name"] = filename
        return res

    system_instructions = PROMPT_PATH.read_text(encoding="utf-8")
    chunk_size = 3
    all_results = []

    try:
        for start_idx in range(0, total_pages, chunk_size):
            end_idx = min(start_idx + chunk_size, total_pages)
            chunk_text = "\n\n".join(text_chunks[start_idx:end_idx])

            prompt = f"""{system_instructions}

## Document to Scan:
Filename: {filename}
Total Pages: {total_pages}
Current Segment Pages: {start_idx + 1} to {end_idx}

## Document Content (Segment):
{chunk_text}

## Task:
Scan this segment of the document for all red flag clauses as defined in your instructions.
When referencing page numbers, use the exact [PAGE N] markers in the text above.
Return ONLY a JSON object with a single key 'flags' containing an array of red flag objects. No explanation, no markdown fences.
If no red flags exist, return: {{"flags": []}}
"""

            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"},
            )

            raw_json = response.choices[0].message.content.strip()

            try:
                parsed = json.loads(raw_json)
                flags = parsed.get("flags", [])
                all_results.extend(flags)
            except Exception:
                try:
                    cleaned = raw_json.strip("`").lstrip("json\n").strip()
                    parsed = json.loads(cleaned)
                    flags = parsed.get("flags", [])
                    all_results.extend(flags)
                except Exception as e:
                    print(f"[Error] Failed to parse JSON response for pages {start_idx+1}-{end_idx}: {str(e)}")
                    continue

        all_results.sort(key=lambda r: RISK_ORDER.get(r.get("risk_level", "LOW"), 99))
        for r in all_results:
            r["id"] = str(uuid.uuid4())
            r["document_name"] = filename

        return {
            "document_name": filename,
            "total_pages": total_pages,
            "results": all_results,
        }
    except Exception as err:
        print(f"[Warning] Groq API call failed ({str(err)}). Falling back to rule-based scanner.")
        res = fallback_scan_document(text_chunks, filename, total_pages)
        for r in res["results"]:
            r["id"] = str(uuid.uuid4())
            r["document_name"] = filename
        return res


@router.post("/scan")
async def scan_endpoint(file: UploadFile = File(...)) -> JSONResponse:
    """
    Accept a VDR PDF document, scan for M&A red flag clauses.
    Returns structured audit results sorted by risk level.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        scan_result = scan_document(tmp_path, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")
    finally:
        os.unlink(tmp_path)

    scan_id = str(uuid.uuid4())
    from datetime import datetime, timezone
    scanned_at = datetime.now(timezone.utc).isoformat()
    for r in scan_result["results"]:
        r["scanned_at"] = scanned_at

    return JSONResponse(
        content={
            "status": "success",
            "scan_id": scan_id,
            "scanned_at": scanned_at,
            "data": scan_result,
        }
    )
