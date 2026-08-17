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
    Scan a VDR document for M&A red flag clauses using Groq / Llama 3.3.
    Processes the document in page chunks to ensure 100% coverage and avoid truncation.

    Args:
        pdf_path: Path to the PDF file
        filename: Original filename for the report

    Returns:
        dict: Scan results with red flag list
    """
    # Extract text page by page
    text_chunks: list[str] = []
    total_pages = 0
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                # Include page number marker for extraction
                text_chunks.append(f"[PAGE {i + 1}]\n{text}")

    # If no text extracted, return empty findings
    if not text_chunks:
        return {
            "document_name": filename,
            "total_pages": total_pages,
            "results": [],
        }

    # Load prompts
    system_instructions = PROMPT_PATH.read_text(encoding="utf-8")

    # Define chunk size (number of pages processed in one prompt)
    chunk_size = 3
    all_results = []

    # Process page groups
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
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"},
        )

        raw_json = response.choices[0].message.content.strip()

        try:
            parsed = json.loads(raw_json)
            flags = parsed.get("flags", [])
            all_results.extend(flags)
        except Exception:
            # Fallback cleaning if markdown code fences were returned
            try:
                cleaned = raw_json.strip("`").lstrip("json\n").strip()
                parsed = json.loads(cleaned)
                flags = parsed.get("flags", [])
                all_results.extend(flags)
            except Exception as e:
                # Log error and continue to avoid crashing the entire scan
                print(f"[Error] Failed to parse JSON response for pages {start_idx+1}-{end_idx}: {str(e)}")
                continue

    # Sort by risk level
    all_results.sort(key=lambda r: RISK_ORDER.get(r.get("risk_level", "LOW"), 99))

    # Attach IDs and document name
    for r in all_results:
        r["id"] = str(uuid.uuid4())
        r["document_name"] = filename
        r["scanned_at"] = ""  # Will be set in the endpoint

    return {
        "document_name": filename,
        "total_pages": total_pages,
        "results": all_results,
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
