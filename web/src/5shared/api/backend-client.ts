/**
 * Server-only client for the Python backend. Never import this from a
 * "use client" component — INTERNAL_API_SECRET must stay off the browser.
 */
import "server-only";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://backend:8000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET ?? "";
/** Таймаут запроса к backend (Marzban может отвечать медленно). */
const BACKEND_TIMEOUT_MS = 15_000;

/** Backend ответил ошибкой (например 502 — Marzban отклонил запрос). */
class BackendError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Backend недоступен: сетевые ошибки, таймаут, DNS. */
class BackendUnavailableError extends Error {
  constructor(message = "backend unavailable") {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": INTERNAL_API_SECRET,
        ...init?.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
  } catch (err) {
    // fetch бросает TypeError при сетевых сбоях и AbortError по таймауту.
    throw new BackendUnavailableError(err instanceof Error ? err.message : undefined);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new BackendError(res.status, detail || `backend request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const backend = {
  createVpnUser() {
    return call<{ username: string; subscription_url: string }>("/provisioning/create", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },
  setStatus(username: string, status: "active" | "disabled") {
    return call<{ ok: true }>("/provisioning/status", {
      method: "POST",
      body: JSON.stringify({ username, status }),
    });
  },
  rotateKey(username: string) {
    return call<{ subscription_url: string }>("/provisioning/rotate", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
  },
  getUsage(username: string) {
    return call<{ used_traffic: number; status: string; online_at: string | null }>(
      `/provisioning/usage/${encodeURIComponent(username)}`,
    );
  },
};

/** Результат VPN-провизионинга группы. */
export type VpnProvisionResult = {
  marzbanUsername: string;
  subscriptionUrl: string;
};

/**
 * Создаёт Marzban-аккаунт для группы (один общий аккаунт на всю группу).
 * Вызывается при регистрации ПЕРВОГО пользователя группы.
 *
 * @throws BackendError — Marzban/backend ответил ошибкой (например 502)
 * @throws BackendUnavailableError — backend недоступен (сеть/таймаут)
 */
export async function provisionVpnForGroup(): Promise<VpnProvisionResult> {
  const res = await backend.createVpnUser();
  return {
    marzbanUsername: res.username,
    subscriptionUrl: res.subscription_url,
  };
}

export { BackendError, BackendUnavailableError };
