"use client";

import { useState } from "react";

type Os = "windows" | "macos" | "linux" | "android";

const DOWNLOAD_LINKS: Record<Os, string> = {
  windows: "https://github.com/hiddify/hiddify-next/releases/latest",
  macos: "https://github.com/hiddify/hiddify-next/releases/latest",
  linux: "https://github.com/hiddify/hiddify-next/releases/latest",
  android: "https://github.com/hiddify/hiddify-next/releases/latest",
};

const OS_LABELS: Record<Os, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  android: "Android",
};

export function ConnectPanel({ subscriptionUrl }: { subscriptionUrl: string | null }) {
  const [os, setOs] = useState<Os>("windows");
  const [copied, setCopied] = useState(false);

  if (!subscriptionUrl) {
    return (
      <div className="card border border-rose-500/10 bg-rose-500/5 p-6 text-center">
        <svg className="mx-auto h-8 w-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="mt-3 text-sm font-semibold text-rose-300">
          VPN-ключ еще не выдан.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Пожалуйста, свяжитесь с системным администратором вашей компании для активации доступа.
        </p>
      </div>
    );
  }

  const deepLink = `hiddify://import/${encodeURIComponent(subscriptionUrl)}`;

  async function copyKey() {
    await navigator.clipboard.writeText(subscriptionUrl!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-white mb-4">Настройка VPN-подключения</h2>
        <p className="label">1. Выберите вашу платформу</p>
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.05] bg-black/35 p-1.5 sm:grid-cols-4">
          {(Object.keys(OS_LABELS) as Os[]).map((key) => (
            <button
              id={`platform-btn-${key}`}
              key={key}
              onClick={() => setOs(key)}
              className={`rounded-xl py-2 px-3 text-xs font-bold transition-all duration-200 ${
                os === key
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {OS_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label">2. Загрузите клиент (Hiddify Next)</p>
        <a
          id="client-download-link"
          href={DOWNLOAD_LINKS[os]}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost w-full py-3 flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Скачать для {OS_LABELS[os]}
        </a>
      </div>

      <div>
        <p className="label">3. Скопируйте ключ или импортируйте напрямую</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1 overflow-hidden rounded-xl border border-white/[0.05] bg-black/40 px-3.5 py-2.5">
            <code className="block overflow-x-auto whitespace-nowrap text-xs text-blue-300 scrollbar-none font-mono">
              {subscriptionUrl}
            </code>
          </div>
          <button
            id="copy-subscription-key-btn"
            className="btn-ghost py-2.5 px-4 shrink-0 flex items-center justify-center gap-2"
            onClick={copyKey}
          >
            {copied ? (
              <>
                <svg className="h-4 w-4 text-emerald-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400">Скопировано!</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h5m-2 5h2" />
                </svg>
                <span>Скопировать</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <a
          id="connect-vpn-deeplink"
          href={deepLink}
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Импортировать в Hiddify
        </a>
        <p className="mt-2.5 text-center text-xs text-slate-500">
          Клик по кнопке автоматически откроет установленный клиент и импортирует подписку.
        </p>
      </div>
    </div>
  );
}
