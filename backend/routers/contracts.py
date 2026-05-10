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
    contract_a_id: str = Form(...),
    contract_b_id: str = Form(...),
) -> JSONResponse:
    """
    Compare two previously extracted contracts and return a delta report.
    Flags any inflation-adjusted premium increase > 15% as DISCREPANCY.
    """
    contract_a = _extracted_contracts.get(contract_a_id)
    contract_b = _extracted_contracts.get(contract_b_id)

    if not contract_a:
        raise HTTPException(status_code=404, detail=f"Contract {contract_a_id} not found.")
    if not contract_b:
        raise HTTPException(status_code=404, detail=f"Contract {contract_b_id} not found.")

    try:
        delta_report = calculate_deltas(contract_a, contract_b)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delta calculation failed: {str(e)}")

    report_id = str(uuid.uuid4())
    delta_report["id"] = report_id

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
