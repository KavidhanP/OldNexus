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


def scan_document(pdf_path: str, filename: str) -> dict:
    """
    Scan a VDR document for M&A red flag clauses using Gemini.

    Args:
        pdf_path: Path to the PDF file
        filename: Original filename for the report

    Returns:
        dict: Scan results with red flag list
    """
    # Extract text
    text_chunks: list[str] = []
    total_pages = 0
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                # Include page number marker for extraction
                text_chunks.append(f"[PAGE {i + 1}]\n{text}")

    raw_text = "\n\n".join(text_chunks)[:40_000]  # 40k char context limit

    system_instructions = PROMPT_PATH.read_text(encoding="utf-8")

    prompt = f"""{system_instructions}

## Document to Scan:
Filename: {filename}
Total Pages: {total_pages}

## Document Content:
{raw_text}

## Task:
Scan the document for all red flag clauses as defined in your instructions.
When referencing page numbers, use the [PAGE N] markers in the text above.
Return ONLY a JSON object with a single key 'flags' containing an array of red flag objects. No explanation, no markdown fences.
If no red flags exist, return: {{"flags": []}}
"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    raw_json = response.choices[0].message.content.strip()

    parsed = json.loads(raw_json)
    results = parsed.get("flags", [])

    # Sort by risk level
    results.sort(key=lambda r: RISK_ORDER.get(r.get("risk_level", "LOW"), 99))

    # Attach IDs and document name
    for r in results:
        r["id"] = str(uuid.uuid4())
        r["document_name"] = filename
        r["scanned_at"] = ""  # Will be set in the endpoint

    return {
        "document_name": filename,
        "total_pages": total_pages,
        "results": results,
    }


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
