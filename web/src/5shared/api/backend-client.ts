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

/** Результат VPN-провизионинга сотрудника. */
export type VpnProvisionResult = {
  marzbanUsername: string;
  subscriptionUrl: string;
};

/**
 * Dev-заглушка: VPN_PROVISION_MODE=mock в .env — не ходим в backend/Marzban,
 * а генерируем фейковые данные. Только для разработки, в production
 * переменная не должна быть задана.
 */
const VPN_PROVISION_MODE = process.env.VPN_PROVISION_MODE ?? "real";

/** true в дев-режиме без Marzban — управляющие вызовы (setStatus и т.п.) пропускаются. */
export const isVpnMockMode = VPN_PROVISION_MODE === "mock";

function mockProvision(): VpnProvisionResult {
  const id = crypto.randomUUID().slice(0, 8);
  return {
    marzbanUsername: `mock_user_${id}`,
    subscriptionUrl: `https://mock.vpn.local/sub/${id}`,
  };
}

/**
 * Создаёт индивидуальный Marzban-аккаунт для сотрудника.
 * Вызывается при регистрации КАЖДОГО пользователя (1 сотрудник = 1 аккаунт).
 *
 * При VPN_PROVISION_MODE=mock возвращает фейковые данные без запроса
 * к backend — для локальной разработки без Marzban.
 *
 * @throws BackendError — Marzban/backend ответил ошибкой (например 502)
 * @throws BackendUnavailableError — backend недоступен (сеть/таймаут)
 */
export async function provisionVpnForUser(): Promise<VpnProvisionResult> {
  if (isVpnMockMode) {
    return mockProvision();
  }
  const res = await backend.createVpnUser();
  return {
    marzbanUsername: res.username,
    subscriptionUrl: res.subscription_url,
  };
}

/**
 * Меняет статус Marzban-аккаунта (бан/разбан сотрудника, suspend группы).
 * Best-effort семантику решает вызывающий. В mock-режиме — no-op.
 */
export async function setVpnStatus(
  marzbanUsername: string | null,
  status: "active" | "disabled",
): Promise<void> {
  if (isVpnMockMode || !marzbanUsername) return;
  await backend.setStatus(marzbanUsername, status);
}

export { BackendError, BackendUnavailableError };
