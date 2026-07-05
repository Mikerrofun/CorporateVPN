"""Thin async Marzban API client.

Adapted from a previous Telegram-VPN project's bot/services/marzban.py: same
token-refresh/retry shape, but simplified for this product —
- one Marzban server, one shared account per corporation: no per-employee
  provisioning, no per-group inbound scoping/failover
- no per-plan expiry/traffic tariffs: a corporation gets unlimited access
  while ACTIVE (suspend == Marzban status=disabled)
- no telegram-id bookkeeping: the caller (Next.js, via the internal API) always
  passes the Marzban username explicitly once it has been provisioned, so this
  client never needs its own id->username lookup table
"""
from __future__ import annotations

import asyncio
import secrets
import time

import httpx

from app.config import settings


class MarzbanError(Exception):
    pass


def _random_username() -> str:
    return f"corp_{secrets.token_hex(12)}"


def _tls_verify() -> bool | str:
    return settings.marzban_tls_ca_file or True


class MarzbanClient:
    def __init__(self) -> None:
        self.base_url = settings.marzban_base_url.rstrip("/")
        self._token: str | None = None
        self._token_exp: float = 0.0
        self._auth_lock = asyncio.Lock()

    async def _authenticate(self, client: httpx.AsyncClient) -> None:
        resp = await client.post(
            f"{self.base_url}/api/admin/token",
            data={"username": settings.marzban_username, "password": settings.marzban_password},
        )
        if resp.status_code != 200:
            raise MarzbanError(f"auth failed: {resp.status_code} {resp.text}")
        self._token = resp.json()["access_token"]
        self._token_exp = time.time() + 3600

    async def _auth_header(self, client: httpx.AsyncClient) -> dict[str, str]:
        if not self._token or time.time() > self._token_exp:
            async with self._auth_lock:
                if not self._token or time.time() > self._token_exp:
                    await self._authenticate(client)
        return {"Authorization": f"Bearer {self._token}"}

    async def _request(self, method: str, path: str, client: httpx.AsyncClient, **kwargs) -> httpx.Response:
        headers = await self._auth_header(client)
        resp = await client.request(method, f"{self.base_url}{path}", headers=headers, **kwargs)
        if resp.status_code == 401:
            async with self._auth_lock:
                self._token = None
                self._token_exp = 0.0
                await self._authenticate(client)
            headers = {"Authorization": f"Bearer {self._token}"}
            resp = await client.request(method, f"{self.base_url}{path}", headers=headers, **kwargs)
        return resp

    def _inbounds_payload(self) -> dict:
        if not settings.marzban_inbound_tag:
            return {}
        return {settings.marzban_protocol: [settings.marzban_inbound_tag]}

    async def get_user(self, username: str, client: httpx.AsyncClient) -> dict | None:
        resp = await self._request("GET", f"/api/user/{username}", client)
        if resp.status_code == 404:
            return None
        if resp.status_code != 200:
            raise MarzbanError(f"get_user: {resp.status_code} {resp.text}")
        return resp.json()

    def _full_sub_url(self, sub_url: str) -> str:
        return sub_url if sub_url.startswith("http") else f"{self.base_url}{sub_url}"

    async def create_user(self, *, username: str | None = None) -> dict:
        """Create a new, unlimited-access Marzban user — one shared account per corporation."""
        async with httpx.AsyncClient(timeout=20.0, verify=_tls_verify()) as client:
            if not username:
                for _ in range(8):
                    candidate = _random_username()
                    if not await self.get_user(candidate, client):
                        username = candidate
                        break
                else:
                    raise MarzbanError("could not generate a unique Marzban username")
            payload = {
                "username": username,
                "proxies": settings.proxy_config or {settings.marzban_protocol: {}},
                "inbounds": self._inbounds_payload(),
                "expire": 0,  # 0 = never expires; access is gated by status, not time
                "data_limit": 0,  # 0 = unlimited traffic
                "data_limit_reset_strategy": "no_reset",
                "status": "active",
            }
            resp = await self._request("POST", "/api/user", client, json=payload)
            if resp.status_code not in (200, 201):
                raise MarzbanError(f"create: {resp.status_code} {resp.text}")
            data = resp.json()
            return {
                "username": username,
                "subscription_url": self._full_sub_url(data.get("subscription_url", "")),
            }

    async def set_status(self, username: str, status: str) -> None:
        """status: 'active' | 'disabled' — used to suspend/resume a corporation's VPN access."""
        if status not in ("active", "disabled"):
            raise MarzbanError(f"invalid status: {status}")
        async with httpx.AsyncClient(timeout=15.0, verify=_tls_verify()) as client:
            resp = await self._request("PUT", f"/api/user/{username}", client, json={"status": status})
        if resp.status_code != 200:
            raise MarzbanError(f"set_status: {resp.status_code} {resp.text}")

    async def revoke_sub(self, username: str) -> str:
        """Rotate the subscription token; old client configs stop working."""
        async with httpx.AsyncClient(timeout=15.0, verify=_tls_verify()) as client:
            resp = await self._request("POST", f"/api/user/{username}/revoke_sub", client)
        if resp.status_code != 200:
            raise MarzbanError(f"revoke_sub: {resp.status_code} {resp.text}")
        return self._full_sub_url(resp.json().get("subscription_url", ""))

    async def get_usage(self, username: str) -> dict | None:
        async with httpx.AsyncClient(timeout=8.0, verify=_tls_verify()) as client:
            data = await self.get_user(username, client)
        if not data:
            return None
        return {
            "used_traffic": int(data.get("used_traffic") or 0),
            "status": data.get("status"),
            "online_at": data.get("online_at") or data.get("last_online") or data.get("last_online_at"),
        }


marzban = MarzbanClient()
