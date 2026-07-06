"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateEmployeeForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, email, name, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Не удалось создать сотрудника");
      return;
    }
    setEmail("");
    setName("");
    setPassword("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        id={`btn-open-create-employee-${companyId}`}
        className="rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold text-slate-300 py-1.5 px-3 flex items-center gap-1.5"
        onClick={() => setOpen(true)}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Сотрудник
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.05] bg-slate-950/45 p-5 space-y-4 w-full">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-bold text-white text-sm">Новый сотрудник компании</h4>
        <button
          id={`btn-close-create-employee-${companyId}`}
          className="rounded-lg border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-semibold text-slate-400 py-1 px-2.5"
          onClick={() => setOpen(false)}
        >
          Закрыть
        </button>
      </div>

      <form className="grid gap-4 md:grid-cols-3" onSubmit={submit}>
        <div>
          <label htmlFor={`employee-email-${companyId}`} className="label">Email / Логин</label>
          <input
            id={`employee-email-${companyId}`}
            className="input"
            type="email"
            required
            placeholder="user@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`employee-name-${companyId}`} className="label">Имя сотрудника</label>
          <input
            id={`employee-name-${companyId}`}
            className="input"
            placeholder="Иван Иванов"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`employee-password-${companyId}`} className="label">Пароль</label>
          <input
            id={`employee-password-${companyId}`}
            className="input"
            type="password"
            minLength={8}
            required
            placeholder="Минимум 8 знаков"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="flex gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400 md:col-span-3">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          id={`btn-submit-create-employee-${companyId}`}
          className="btn-primary py-2.5 md:col-span-3 w-full"
          disabled={loading}
          type="submit"
        >
          {loading ? "Создаем..." : "Создать сотрудника"}
        </button>
      </form>
    </div>
  );
}
