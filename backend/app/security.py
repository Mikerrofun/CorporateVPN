"""Auth for calls coming from the Next.js server (never exposed to browsers)."""
from __future__ import annotations

import hmac

from fastapi import Header, HTTPException

from app.config import settings


async def require_internal_secret(x_internal_secret: str = Header(default="")) -> None:
    if not hmac.compare_digest(x_internal_secret, settings.internal_api_secret):
        raise HTTPException(status_code=401, detail="invalid internal secret")
