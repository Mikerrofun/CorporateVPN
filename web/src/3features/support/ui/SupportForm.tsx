"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TOPICS = [
  { value: "CONNECTION", label: "Проблема с подключением" },
  { value: "SPEED", label: "Низкая скорость" },
  { value: "ACCOUNT", label: "Аккаунт и доступ" },
  { value: "OTHER", label: "Другое" },
];

export function SupportForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("CONNECTION");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, message }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Не удалось отправить обращение");
      return;
    }
    setMessage("");
    setSent(true);
    router.refresh();
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 bg-panel/30 border border-white/[0.05]">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-white">Новое обращение в поддержку</h2>
        <p className="text-xs text-slate-400 mt-1">
          Опишите возникшую проблему, и администратор платформы рассмотрит ее в ближайшее время.
        </p>
      </div>

      <div>
        <label htmlFor="support-topic-select" className="label">Тема обращения</label>
        <select
          id="support-topic-select"
          className="input appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] pr-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          }}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value} className="bg-slate-900 text-slate-100">
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="support-message-textarea" className="label">Описание проблемы</label>
        <textarea
          id="support-message-textarea"
          className="input min-h-[130px] resize-y"
          required
          maxLength={2000}
          placeholder="Подробно опишите, что пошло не так..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {error && (
        <div className="flex gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-sm text-rose-400">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {sent && (
        <div className="flex gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-sm text-emerald-400">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Обращение успешно отправлено администратору!</span>
        </div>
      )}

      <button
        id="support-submit-btn"
        type="submit"
        className="btn-primary px-6 py-3 self-start sm:w-auto w-full"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Отправка...
          </span>
        ) : (
          "Отправить"
        )}
      </button>
    </form>
  );
}
