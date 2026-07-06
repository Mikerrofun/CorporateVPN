"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      companyCode,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Неверный логин, пароль или код корпорации");
      return;
    }

    const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
    const session = await sessionRes.json().catch(() => null);
    const role = session?.user?.role;
    router.push(role === "ADMIN" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="card w-full max-w-md border border-white/[0.06] bg-panel/40 backdrop-blur-2xl p-8 shadow-2xl">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">
          Corporate VPN
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Единый вход</h1>
        <p className="mt-2 text-sm text-slate-400">
          Введите учетные данные сотрудника или администратора
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="label">Логин / Email</label>
          <input
            id="login-email"
            className="input"
            type="email"
            autoComplete="username"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="label">Пароль</label>
          <input
            id="login-password"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-company-code" className="label">Код корпорации</label>
          <input
            id="login-company-code"
            className="input uppercase tracking-wider placeholder:normal-case"
            required
            value={companyCode}
            onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
            placeholder="CORP-XXXX"
            autoComplete="organization"
          />
        </div>

        {error && (
          <div className="flex gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          id="login-submit-btn"
          type="submit"
          className="btn-primary w-full py-3"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Вход в кабинет...
            </span>
          ) : (
            "Войти"
          )}
        </button>
      </form>

      <div className="mt-6 border-t border-white/[0.05] pt-5 text-center">
        <p className="text-xs text-slate-500">
          Если у вас нет учетных данных или кода, обратитесь к менеджеру вашей организации.
        </p>
      </div>
    </div>
  );
}
