"use client";

import { useState } from "react";
import { useLoginForm, useRegisterForm } from "../model";

export function LoginForm() {
  const [tab, setTab] = useState<"login" | "register">("login");
  
  // Hooks for both tabs
  const loginHook = useLoginForm();
  const registerHook = useRegisterForm();

  return (
    <div className="card w-full max-w-md border border-white/[0.06] bg-panel/40 backdrop-blur-2xl p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400">Corporate VPN</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Личный кабинет</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex rounded-xl border border-white/[0.05] bg-black/30 p-1">
        <button
          onClick={() => { setTab("login"); }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${tab === "login" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
        >
          Войти
        </button>
        <button
          onClick={() => { setTab("register"); }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${tab === "register" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
        >
          Регистрация
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={loginHook.form.handleSubmit(loginHook.onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input 
              className="input" 
              type="email" 
              placeholder="name@company.com"
              {...loginHook.form.register("email")}
            />
            {loginHook.form.formState.errors.email && (
              <p className="mt-1 text-xs text-red-400">{loginHook.form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="label">Пароль</label>
            <input 
              className="input" 
              type="password" 
              placeholder="••••••••"
              {...loginHook.form.register("password")}
            />
            {loginHook.form.formState.errors.password && (
              <p className="mt-1 text-xs text-red-400">{loginHook.form.formState.errors.password.message}</p>
            )}
          </div>
          {loginHook.error && <p className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{loginHook.error}</p>}
          <button type="submit" disabled={loginHook.loading} className="btn-primary w-full py-3">
            {loginHook.loading ? "Вход..." : "Войти"}
          </button>
        </form>
      ) : (
        <form onSubmit={registerHook.form.handleSubmit(registerHook.onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input 
              className="input" 
              type="email" 
              placeholder="name@company.com"
              {...registerHook.form.register("email")}
            />
            {registerHook.form.formState.errors.email && (
              <p className="mt-1 text-xs text-red-400">{registerHook.form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="label">Имя (необязательно)</label>
            <input 
              className="input" 
              type="text" 
              placeholder="Иван Иванов"
              {...registerHook.form.register("name")}
            />
            {registerHook.form.formState.errors.name && (
              <p className="mt-1 text-xs text-red-400">{registerHook.form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label">Пароль</label>
            <input 
              className="input" 
              type="password" 
              placeholder="Минимум 8 символов"
              {...registerHook.form.register("password")}
            />
            {registerHook.form.formState.errors.password && (
              <p className="mt-1 text-xs text-red-400">{registerHook.form.formState.errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="label">Инвайт-код группы</label>
            <input 
              className="input uppercase tracking-wider" 
              placeholder="XXXXXXXX"
              {...registerHook.form.register("inviteCode", {
                setValueAs: (v) => v.toUpperCase()
              })}
            />
            {registerHook.form.formState.errors.inviteCode && (
              <p className="mt-1 text-xs text-red-400">{registerHook.form.formState.errors.inviteCode.message}</p>
            )}
          </div>
          {registerHook.error && <p className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{registerHook.error}</p>}
          <button type="submit" disabled={registerHook.loading} className="btn-primary w-full py-3">
            {registerHook.loading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-slate-500">
        Инвайт-код получите у администратора вашей компании.
      </p>
    </div>
  );
}
