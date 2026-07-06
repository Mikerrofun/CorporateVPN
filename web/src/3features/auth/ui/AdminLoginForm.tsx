"use client";

import { useAdminLoginForm } from "../model";

export function AdminLoginForm() {
  const { form, onSubmit, error, loading } = useAdminLoginForm();

  return (
    <div className="card w-full max-w-sm border border-white/[0.06] bg-panel/40 backdrop-blur-2xl p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Corporate VPN</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Панель управления</h1>
        <p className="mt-1 text-sm text-slate-400">Вход для администратора</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Логин</label>
          <input 
            className="input" 
            type="text" 
            autoComplete="username"
            placeholder="admin" 
            {...form.register("login")}
          />
          {form.formState.errors.login && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.login.message}</p>
          )}
        </div>
        <div>
          <label className="label">Пароль</label>
          <input 
            className="input" 
            type="password" 
            autoComplete="current-password"
            placeholder="••••••••" 
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.password.message}</p>
          )}
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
