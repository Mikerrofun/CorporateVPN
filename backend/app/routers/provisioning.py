"""Corporation VPN-account provisioning. Called only from the Next.js server
(never from a browser) — Next.js is the source of truth for which Marzban
username belongs to which corporation and persists it after these calls return.

One Marzban server, one shared account per corporation — no per-employee
accounts, no per-group inbound scoping.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.marzban_client import MarzbanError, marzban
from app.security import require_internal_secret

router = APIRouter(prefix="/provisioning", tags=["provisioning"], dependencies=[Depends(require_internal_secret)])


class SetStatusIn(BaseModel):
    username: str
    status: str  # "active" | "disabled"


class UsernameIn(BaseModel):
    username: str


@router.post("/create")
async def create() -> dict:
    try:
        return await marzban.create_user()
    except MarzbanError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/status")
async def set_status(payload: SetStatusIn) -> dict:
    try:
        await marzban.set_status(payload.username, payload.status)
    except MarzbanError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"ok": True}


@router.post("/rotate")
async def rotate(payload: UsernameIn) -> dict:
    try:
        subscription_url = await marzban.revoke_sub(payload.username)
    except MarzbanError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"subscription_url": subscription_url}


@router.get("/usage/{username}")
async def usage(username: str) -> dict:
    try:
        data = await marzban.get_usage(username)
    except MarzbanError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    if data is None:
        raise HTTPException(status_code=404, detail="not found")
    return data
