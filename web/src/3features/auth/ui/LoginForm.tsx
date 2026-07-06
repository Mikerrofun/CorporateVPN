"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("employee-login", { login: email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Неверный email или пароль");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, inviteCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Ошибка регистрации");
      return;
    }
    // После регистрации сразу логиним
    await signIn("employee-login", { login: email, password, redirect: false });
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="card w-full max-w-md border border-white/[0.06] bg-panel/40 backdrop-blur-2xl p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Corporate VPN</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Личный кабинет</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex rounded-xl border border-white/[0.05] bg-black/30 p-1">
        <button
          onClick={() => { setTab("login"); setError(null); }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${tab === "login" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
        >
          Войти
        </button>
        <button
          onClick={() => { setTab("register"); setError(null); }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${tab === "register" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
        >
          Регистрация
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required placeholder="name@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Пароль</label>
            <input className="input" type="password" required placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      ) : (
        <form onSubmit={onRegister} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required placeholder="name@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Имя (необязательно)</label>
            <input className="input" type="text" placeholder="Иван Иванов"
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Пароль</label>
            <input className="input" type="password" required placeholder="Минимум 8 символов"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="label">Инвайт-код группы</label>
            <input className="input uppercase tracking-wider" required placeholder="XXXXXXXX"
              value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} />
          </div>
          {error && <p className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-slate-500">
        Инвайт-код получите у администратора вашей компании.
      </p>
    </div>
  );
}
