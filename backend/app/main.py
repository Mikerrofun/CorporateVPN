"""FastAPI backend: Marzban provisioning for the corporate VPN app.

This service is intentionally stateless with respect to business data (no
companies/employees here — that's Prisma/Postgres, owned by the web app). It
only talks to the one Marzban server.
"""
from __future__ import annotations

import logging

from fastapi import FastAPI

from app.routers.provisioning import router as provisioning_router

logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

app = FastAPI(title="CorporateVPN backend", version="0.1.0")
app.include_router(provisioning_router)


@app.get("/healthz")
async def healthz() -> dict:
    return {"ok": True}
