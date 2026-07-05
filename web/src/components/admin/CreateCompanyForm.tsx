"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateCompanyForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ code: string; subscriptionUrl: string | null } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreated(null);
    const res = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Не удалось создать корпорацию");
      return;
    }
    setName("");
    setCreated({ code: data.company?.code, subscriptionUrl: data.company?.subscriptionUrl ?? null });
    router.refresh();
  }

  if (!open) {
    return (
      <button
        id="btn-open-create-company"
        className="btn-primary flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Создать корпорацию
      </button>
    );
  }

  return (
    <div className="card border border-blue-500/10 bg-panel/30 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-white text-base">Новая корпорация</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Код входа и подписка Hiddify будут сгенерированы автоматически.
          </p>
        </div>
        <button
          id="btn-close-create-company"
          className="btn-ghost py-1.5 px-3 self-end sm:self-auto"
          onClick={() => setOpen(false)}
        >
          Закрыть
        </button>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={submit}>
        <div className="flex-1">
          <label htmlFor="company-name-input" className="label">Название корпорации</label>
          <input
            id="company-name-input"
            className="input"
            required
            minLength={2}
            maxLength={120}
            placeholder="Например: Vexory IT"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          id="btn-submit-create-company"
          className="btn-primary px-6 py-2.5 shrink-0"
          disabled={loading}
          type="submit"
        >
          {loading ? "Создаем..." : "Создать"}
        </button>
      </form>

      {error && (
        <div className="flex gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-sm text-rose-400">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {created && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 text-sm text-emerald-400">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-bold text-white">Корпорация создана успешно!</p>
          </div>
          <p className="text-slate-300">
            Передайте код входа сотрудникам: <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 select-all">{created.code}</span>
          </p>
          {created.subscriptionUrl && (
            <div className="pt-1">
              <p className="text-xs text-slate-400 mb-1">Ссылка общей подписки:</p>
              <code className="block break-all rounded-lg bg-black/40 p-2.5 font-mono text-xs text-blue-300 border border-white/[0.04] select-all">
                {created.subscriptionUrl}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
