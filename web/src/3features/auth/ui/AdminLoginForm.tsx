"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("admin-login", { login, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Неверный логин или пароль");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="card w-full max-w-sm border border-white/[0.06] bg-panel/40 backdrop-blur-2xl p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Corporate VPN</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Панель управления</h1>
        <p className="mt-1 text-sm text-slate-400">Вход для администратора</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Логин</label>
          <input className="input" type="text" required autoComplete="username"
            placeholder="admin" value={login} onChange={(e) => setLogin(e.target.value)} />
        </div>
        <div>
          <label className="label">Пароль</label>
          <input className="input" type="password" required autoComplete="current-password"
            placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && (
          <p className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
