/**
 * Server-only client for the Python backend. Never import this from a
 * "use client" component — INTERNAL_API_SECRET must stay off the browser.
 */
import "server-only";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://backend:8000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET ?? "";

class BackendError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Secret": INTERNAL_API_SECRET,
      ...init?.headers,
    },
    cache: "no-store",
  });
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

export { BackendError };
