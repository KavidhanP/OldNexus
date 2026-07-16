"""
Nexus OS — Contracts Router
Endpoints:
  POST /contracts/extract  — Upload PDF, extract fields via Gemini
  POST /contracts/compare  — Compare two extracted contracts via Pandas
"""

import os
import uuid
import tempfile
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from backend.scripts.extract_data import extract_contract
from backend.scripts.calculate_deltas import calculate_deltas

router = APIRouter()

# In-memory store for demo (replace with Supabase in production)
_extracted_contracts: dict[str, dict] = {}


@router.post("/extract")
async def extract_endpoint(file: UploadFile = File(...)) -> JSONResponse:
    """
    Accept a PDF upload, extract structured insurance data using Gemini.
    Returns the extracted JSON and assigns a contract_id.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # Save to temp file
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        extracted = extract_contract(tmp_path)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
    finally:
        os.unlink(tmp_path)

    contract_id = str(uuid.uuid4())
    extracted["id"] = contract_id
    extracted["original_filename"] = file.filename
    _extracted_contracts[contract_id] = extracted

    return JSONResponse(
        content={
            "status": "success",
            "contract_id": contract_id,
            "data": extracted,
        }
    )


@router.post("/compare")
async def compare_endpoint(
    contract_a: str = Form(...),
    contract_b: str = Form(...),
) -> JSONResponse:
    """
    Compare two extracted contracts and return a delta report.
    Accepts full contract JSON strings directly — no in-memory lookup required.
    Flags any inflation-adjusted premium increase > 15% as DISCREPANCY.
    """
    import json as _json

    try:
        data_a = _json.loads(contract_a)
        data_b = _json.loads(contract_b)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid contract JSON payload.")

    try:
        delta_report = calculate_deltas(data_a, data_b)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delta calculation failed: {str(e)}")

    report_id = str(uuid.uuid4())
    delta_report["id"] = report_id
    delta_report["contract_a_id"] = data_a.get("id", "")
    delta_report["contract_b_id"] = data_b.get("id", "")
    delta_report["generated_at"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"

    return JSONResponse(
        content={
            "status": "success",
            "report_id": report_id,
            "data": delta_report,
        }
    )


@router.get("/list")
def list_contracts() -> JSONResponse:
    """Return all extracted contracts (demo endpoint)."""
    return JSONResponse(
        content={
            "status": "success",
            "count": len(_extracted_contracts),
            "contracts": list(_extracted_contracts.values()),
        }
    )
