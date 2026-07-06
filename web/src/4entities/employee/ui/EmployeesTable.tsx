"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: string;
  email: string;
  name: string | null;
  status: "ACTIVE" | "BANNED";
};

export function EmployeesTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/employees/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(data.error ?? "Действие не выполнено");
      return;
    }
    router.refresh();
  }

  function remove(id: string) {
    if (!confirm("Удалить сотрудника без возможности восстановления?")) return;
    act(id, { action: "delete" });
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-3 flex gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Mobile-friendly stack of cards */}
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-white/[0.04] bg-black/20 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-white break-all">{row.email}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  row.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                <span className={`h-1 w-1 rounded-full ${row.status === "ACTIVE" ? "bg-emerald-400" : "bg-rose-400"}`} />
                {row.status === "ACTIVE" ? "Активен" : "Бан"}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Имя</p>
              <p className="text-sm text-slate-300">{row.name ?? "—"}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.03]">
              {row.status === "ACTIVE" ? (
                <button
                  id={`btn-ban-mobile-${row.id}`}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold text-slate-300 py-1.5 px-3"
                  disabled={busyId === row.id}
                  onClick={() => act(row.id, { action: "ban" })}
                >
                  Забанить
                </button>
              ) : (
                <button
                  id={`btn-unban-mobile-${row.id}`}
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs font-semibold text-emerald-400 py-1.5 px-3"
                  disabled={busyId === row.id}
                  onClick={() => act(row.id, { action: "unban" })}
                >
                  Разбанить
                </button>
              )}
              <button
                id={`btn-delete-mobile-${row.id}`}
                className="rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-semibold text-rose-400 py-1.5 px-3"
                disabled={busyId === row.id}
                onClick={() => remove(row.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-center py-6 text-xs text-slate-500">Сотрудников пока нет.</p>
        )}
      </div>

      {/* Desktop traditional table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500 border-b border-white/[0.04]">
            <tr>
              <th className="pb-3 pr-4 font-semibold tracking-wider">Email</th>
              <th className="pb-3 pr-4 font-semibold tracking-wider">Имя</th>
              <th className="pb-3 pr-4 font-semibold tracking-wider">Статус</th>
              <th className="pb-3 pr-4 font-semibold tracking-wider text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="py-3.5 pr-4 font-medium text-white">{row.email}</td>
                <td className="py-3.5 pr-4 text-slate-300">{row.name ?? "—"}</td>
                <td className="py-3.5 pr-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      row.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    <span className={`h-1 w-1 rounded-full ${row.status === "ACTIVE" ? "bg-emerald-400 animate-pulse-slow" : "bg-rose-400"}`} />
                    {row.status === "ACTIVE" ? "Активен" : "Заблокирован"}
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {row.status === "ACTIVE" ? (
                      <button
                        id={`btn-ban-${row.id}`}
                        className="rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold text-slate-300 py-1.5 px-3 transition-colors"
                        disabled={busyId === row.id}
                        onClick={() => act(row.id, { action: "ban" })}
                      >
                        Забанить
                      </button>
                    ) : (
                      <button
                        id={`btn-unban-${row.id}`}
                        className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs font-semibold text-emerald-400 py-1.5 px-3 transition-colors"
                        disabled={busyId === row.id}
                        onClick={() => act(row.id, { action: "unban" })}
                      >
                        Разбанить
                      </button>
                    )}
                    <button
                      id={`btn-delete-${row.id}`}
                      className="rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-semibold text-rose-400 py-1.5 px-3 transition-colors"
                      disabled={busyId === row.id}
                      onClick={() => remove(row.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Сотрудников пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
