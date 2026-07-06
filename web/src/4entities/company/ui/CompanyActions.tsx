"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Action = "suspend" | "resume" | "rotate";

export function CompanyActions({ companyId, status }: { companyId: string; status: "ACTIVE" | "SUSPENDED" }) {
  const router = useRouter();
  const [loading, setLoading] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: Action) {
    if (action === "rotate" && !confirm("Выпустить новую ссылку? Старая перестанет работать у всех сотрудников.")) {
      return;
    }
    setLoading(action);
    setError(null);
    const res = await fetch(`/api/admin/companies/${companyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? "Действие не выполнено");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-1 text-right">
      <div className="flex flex-wrap justify-end gap-2">
        {status === "ACTIVE" ? (
          <button className="btn-ghost" disabled={loading !== null} onClick={() => act("suspend")}>
            {loading === "suspend" ? "Приостанавливаем…" : "Приостановить"}
          </button>
        ) : (
          <button className="btn-ghost" disabled={loading !== null} onClick={() => act("resume")}>
            {loading === "resume" ? "Возобновляем…" : "Возобновить"}
          </button>
        )}
        <button className="btn-ghost" disabled={loading !== null} onClick={() => act("rotate")}>
          {loading === "rotate" ? "Обновляем…" : "Обновить ссылку"}
        </button>
      </div>
      {error && <p className="text-xs text-bad">{error}</p>}
    </div>
  );
}
