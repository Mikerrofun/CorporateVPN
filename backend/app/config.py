"""Settings loaded from environment / .env."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    internal_api_secret: str = "change-me"

    marzban_base_url: str = "http://host.docker.internal:8002"
    marzban_username: str = "admin"
    marzban_password: str = "change-me"
    marzban_tls_ca_file: str = ""
    marzban_proxies: str = "vless"
    marzban_flow: str = ""
    marzban_protocol: str = "vless"  # protocol key used in the Marzban user payload
    # Optional: scope every created account to one inbound tag. Leave blank to
    # let Marzban use its default (all configured inbounds) — there's only one
    # server, so scoping is rarely needed.
    marzban_inbound_tag: str = ""

    @property
    def proxy_config(self) -> dict[str, dict]:
        result: dict[str, dict] = {}
        for proto in self.marzban_proxies.split(","):
            proto = proto.strip().lower()
            if not proto:
                continue
            cfg: dict = {}
            if proto == "vless" and self.marzban_flow:
                cfg["flow"] = self.marzban_flow
            result[proto] = cfg
        return result


settings = Settings()
