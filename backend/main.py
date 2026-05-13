"""
Nexus OS — FastAPI Backend
Run: uvicorn backend.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import contracts, audit

app = FastAPI(
    title="Nexus OS API",
    description="Insurance Premium Discrepancy Engine & M&A Red Flag Scanner",
    version="1.0.0.0 v.sewpaul",
)

# Allow Next.js dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contracts.router, prefix="/contracts", tags=["contracts"])
app.include_router(audit.router, prefix="/audit", tags=["audit"])


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "nexus-os-api"}
